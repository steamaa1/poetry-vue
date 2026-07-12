import { proxyPoetryRequest } from '../../server/poetryProxy.js'

export default async function handler(request) {
  const incoming = new URL(request.url)
  const originalPath = request.headers.get('x-nf-original-path') || incoming.pathname
  const pathname = originalPath.replace(/^\/\.netlify\/functions\/api/, '/api')
  return proxyPoetryRequest(request, { platform: 'Netlify', pathname })
}

export const config = { path: '/api/*' }
