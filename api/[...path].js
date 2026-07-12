import { Readable } from 'node:stream'
import { proxyPoetryRequest } from '../server/poetryProxy.js'

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))
  return chunks.length ? Buffer.concat(chunks) : undefined
}

export default async function handler(request, response) {
  const origin = `https://${request.headers.host}`
  const url = new URL(request.url, origin)
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await readBody(request)
  const webRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body,
  })
  const proxied = await proxyPoetryRequest(webRequest, { platform: 'Vercel' })
  response.statusCode = proxied.status
  proxied.headers.forEach((value, key) => response.setHeader(key, value))
  if (!proxied.body) return response.end()
  Readable.fromWeb(proxied.body).pipe(response)
}
