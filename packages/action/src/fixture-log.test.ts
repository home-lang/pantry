import { expect, test } from 'bun:test'
import { redactFixtureOutput } from './fixture-log'

test('child Action secrets are removed before retaining the command stream', () => {
  const token = 'fixture-token-do-not-publish'
  const output = `::add-mask::${token}\nDownloading with ${token}\nUnrelated native Git output\n`
  expect(redactFixtureOutput(output)).toBe('::add-mask::***\nDownloading with ***\nUnrelated native Git output\n')
  expect(redactFixtureOutput('network failed for known-secret', ['known-secret', undefined, ''])).toBe('network failed for ***')
})

test('escaped multiline masks cannot reappear in retained diagnostics', () => {
  expect(redactFixtureOutput('::add-mask::one%0Atwo%25three\r\none\ntwo%three\n')).toBe('::add-mask::***\r\n***\n')
})
