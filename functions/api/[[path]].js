const UPSTREAM_ORIGIN = 'https://poetry.palemoky.com'

export async function onRequest(context) {
  const incoming = new URL(context.request.url)
  const upstream = new URL(incoming.pathname + incoming.search, UPSTREAM_ORIGIN)

  try {
    const headers = new Headers(context.request.headers)
    headers.delete('host')
    headers.delete('origin')
    headers.delete('referer')

    const response = await fetch(upstream, {
      method: context.request.method,
      headers,
      body: ['GET', 'HEAD'].includes(context.request.method)
        ? undefined
        : context.request.body,
      redirect: 'follow',
    })

    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('X-Poetry-Proxy', 'Cloudflare-Pages')
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    return Response.json(
      {
        error: 'POETRY_API_UNAVAILABLE',
        message: '诗词服务暂时无法访问，请稍后重试。',
      },
      { status: 502 }
    )
  }
}
