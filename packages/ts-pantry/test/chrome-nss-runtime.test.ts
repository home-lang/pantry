import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { NSS_RUNTIME_PROVIDERS, recipe as chrome } from '../src/recipes/google.com/chrome'

/*
 * Chrome loads libnss3 from its own lib directory ($ORIGIN/..), and NSS opens
 * its providers from there with dlopen - outside the DT_NEEDED graph, so no
 * dependency walk finds them. softokn's crypto is libfreeblpriv3 (libfreebl3 is
 * its stub); without it the installed browser aborted at startup with
 * nss_error=-8023 while `--version`, the recipe's only test, still passed.
 */
test('Chrome ships every NSS provider that NSS opens at runtime', () => {
  for (const file of ['libsoftokn3.so', 'libfreebl3.so', 'libfreeblpriv3.so', 'libfreeblpriv3.chk', 'libnssckbi.so'])
    expect(NSS_RUNTIME_PROVIDERS).toContain(file)

  const script = (chrome.build?.script ?? []).map(step => typeof step === 'string' ? step : '').join('\n')
  for (const file of NSS_RUNTIME_PROVIDERS)
    expect(script).toContain(`{{deps.mozilla.org/nss.prefix}}/lib/${file}`)
  expect(chrome.dependencies?.['mozilla.org/nss']).toBe('^3')
})

test('the Linux release gate renders a page with the installed package, not just --version', () => {
  const gate = readFileSync(resolve(import.meta.dir, '../../../.github/scripts/linux-native-browser.ts'), 'utf8')
  expect(gate).toContain('--dump-dom')
  // A clean environment: only HOME and a PATH without the package, so an
  // inherited LD_LIBRARY_PATH cannot supply the library the package lacks.
  expect(gate).toContain(`env: { HOME: root, PATH: '/usr/bin:/bin' }`)
  // The sandbox stays on.
  expect(gate).not.toContain("'--no-sandbox'")
  expect(gate).toContain('userns,')
})
