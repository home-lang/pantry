import { describe, expect, it } from 'bun:test'
import { resolve } from 'node:path'
import { renderTemplate } from '@stacksjs/stx/render'

const SITE = resolve(import.meta.dir, '..', 'site')

// This runs with the locked dependencies in CI. Browser tests additionally
// check computed layout and interactions: the presence of .flex alone did not
// catch the exposed shortcuts panel or overflowing tablet navigation.
describe('site styling contract', () => {
  it('preserves shared styles and generates utility CSS', async () => {
    const html = await renderTemplate(resolve(SITE, 'pages', 'about.stx'), {
      layout: resolve(SITE, 'pages', 'layout.stx'),
      options: { componentsDir: resolve(SITE, 'components') },
      context: { title: 'About' },
      injectCSS: true,
      wrapInDocument: false,
    })

    for (const utility of ['flex', 'items-center', 'mx-auto'])
      expect(html).toMatch(new RegExp(`\\.${utility}\\s*\\{`))
    expect(html).toContain('.header-nav { display: flex;')
    expect(html).toContain('@media (max-width: 1099px)')
    expect(html).toContain('.shortcuts-dialog::backdrop')
    expect(html).toContain('--bg: oklch(')
    expect(html).toContain('<dialog id="shortcuts-dialog"')
    expect(html).not.toMatch(/<dialog[^>]*\sopen(?:\s|=|>)/)
    expect(html).toContain('aria-controls="header-nav" aria-expanded="false"')
    expect(html).not.toContain('shortcuts-backdrop')
  })
})
