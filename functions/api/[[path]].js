import { proxyPoetryRequest } from '../../server/poetryProxy.js'

export function onRequest(context) {
  return proxyPoetryRequest(context.request, { platform: 'Cloudflare-Pages' })
}
