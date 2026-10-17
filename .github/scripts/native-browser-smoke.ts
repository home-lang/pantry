import assert from 'node:assert/strict'
import { join } from 'node:path'

const target = new URL(process.env.PANTRY_RUNTIME_SMOKE_URL!)
const chrome = process.env.PANTRY_RUNTIME_SMOKE_CHROME
const artifacts = process.env.PANTRY_RUNTIME_SMOKE_ARTIFACTS
assert(chrome && artifacts)
const WebView = (Bun as any).WebView
assert.equal(typeof WebView, 'function')
const backend = { type: 'chrome', url: false, path: chrome, ...(process.getuid?.() === 0 ? { argv: ['--no-sandbox'] } : {}) }
let view: any
try {
  view = new WebView({ width: 800, height: 600, backend })
  await view.navigate(target.href)
  const page = await view.evaluate(`(async () => ({ href: location.href, secure: isSecureContext, title: document.title, textLength: document.body.innerText.length, status: (await fetch(location.href, { credentials: 'omit' })).status }))()`)
  assert.equal(new URL(page.href).origin, target.origin)
  assert.equal(page.secure, true)
  assert.equal(page.status, 200)
  assert(page.title.length > 0 && page.textLength > 10)
  const version = await view.cdp('Browser.getVersion')
  assert.equal(version.product.split('/').at(-1), '155.0.8059.84')
  await Bun.write(join(artifacts, 'browser.json'), JSON.stringify({ page, version }, null, 2) + '\n')
}
finally {
  await view?.close()
  await WebView.closeAll()
}
