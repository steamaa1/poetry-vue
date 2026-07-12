const UPSTREAM_ORIGIN = 'https://poetry.palemoky.com'
const UPSTREAM_TIMEOUT = 10000
const UPSTREAM_RETRIES = 2

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function fetchUpstream(url, init) {
  let lastError
  for (let attempt = 0; attempt <= UPSTREAM_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT)
    try {
      const response = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(timeoutId)
      if ((response.status === 408 || response.status === 429 || response.status >= 500) && attempt < UPSTREAM_RETRIES) {
        await wait(500 * (attempt + 1))
        continue
      }
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error
      if (attempt >= UPSTREAM_RETRIES) break
      await wait(500 * (attempt + 1))
    }
  }
  throw lastError || new Error('upstream request failed')
}

export async function proxyPoetryRequest(request, { platform = 'Web-Function', pathname } = {}) {
  const incoming = new URL(request.url)
  const upstreamPath = pathname || incoming.pathname
  const upstream = new URL(upstreamPath + incoming.search, UPSTREAM_ORIGIN)

  try {
    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.delete('origin')
    headers.delete('referer')
    headers.delete('content-length')

    const response = await fetchUpstream(upstream, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
      duplex: request.body ? 'half' : undefined,
    })

    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('X-Poetry-Proxy', platform)
    responseHeaders.set('X-Poetry-Retry-Policy', 'timeout=10s; retries=2')
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    const timedOut = error?.name === 'AbortError'
    return Response.json({
      error: timedOut ? 'POETRY_API_TIMEOUT' : 'POETRY_API_UNAVAILABLE',
      message: timedOut ? '诗词服务响应超时，请稍后重试。' : '诗词服务暂时无法访问，请稍后重试。',
    }, { status: timedOut ? 504 : 502 })
  }
}
