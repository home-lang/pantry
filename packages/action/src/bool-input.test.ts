import { afterEach, expect, test } from 'bun:test'
import { boolInput } from './bool-input'

function setInput(name: string, value: string | undefined): void {
  const key = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
  if (value === undefined)
    delete process.env[key]
  else
    process.env[key] = value
}

afterEach(() => {
  setInput('flag', undefined)
})

test('accepts bare and quoted true/false forms', () => {
  for (const v of ['true', 'True', 'TRUE', '1', 'yes', 'on', ' true ']) {
    setInput('flag', v)
    expect(boolInput('flag', false)).toBe(true)
  }
  for (const v of ['false', 'False', 'FALSE', '0', 'no', 'off', ' false ']) {
    setInput('flag', v)
    expect(boolInput('flag', true)).toBe(false)
  }
})

test('empty input uses the fallback', () => {
  setInput('flag', '')
  expect(boolInput('flag', true)).toBe(true)
  expect(boolInput('flag', false)).toBe(false)
})

test('rejects non-boolean values', () => {
  setInput('flag', 'maybe')
  expect(() => boolInput('flag', false)).toThrow()
})


test('loading the input parser never starts action setup outside a GitHub runner', () => {
  const source = new URL('./bool-input.ts', import.meta.url).pathname
  const child = Bun.spawnSync([process.execPath, '-e', `import { boolInput } from ${JSON.stringify(source)}; process.stdout.write(String(boolInput('flag', false)))`], {
    env: { PATH: process.env.PATH, INPUT_FLAG: 'true', INPUT_VERSION: '0.11.87', INPUT_INSTALL: 'false' },
    stdout: 'pipe', stderr: 'pipe',
  })
  expect(child.exitCode, child.stderr.toString()).toBe(0)
  expect(child.stdout.toString()).toBe('true')
  expect(child.stderr.toString()).toBe('')
})
