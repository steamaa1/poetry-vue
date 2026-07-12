import { proxyPoetryRequest } from '../server/poetryProxy.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      return proxyPoetryRequest(request, { platform: 'Cloudflare-Workers' })
    }
    return env.ASSETS.fetch(request)
  },
}
