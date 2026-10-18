import { expect, test } from 'bun:test'
import { resolveBuildVersion } from '../scripts/resolve-build-version'

test('the native producer reads the real nested DynamoDB metadata', async () => {
  expect(await resolveBuildVersion('aws.amazon.com/dynamodb-local')).toBe('3.3.0')
  expect(await resolveBuildVersion('postgresql.org', '17.11')).toBe('17.11')
  expect(await resolveBuildVersion('openjdk.org', '27.0.0.35')).toBe('27.0.0.35')
})

test('producer inputs cannot escape metadata paths or inject shell and output syntax', async () => {
  for (const domain of ['', '../outside', '/tmp/example', 'aws.amazon.com//local', 'example.org/..', 'example.org/$(id)'])
    await expect(resolveBuildVersion(domain, '3.3.0')).rejects.toThrow('canonical package domain')
  for (const version of ['3.3.0\nother=value', '$(id)', '../3.3.0', '3.3.0;id'])
    await expect(resolveBuildVersion('aws.amazon.com/dynamodb-local', version)).rejects.toThrow('exact package version')
})
