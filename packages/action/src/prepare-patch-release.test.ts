import { expect, test } from 'bun:test'
import { nextPatchVersion, requireQualifiedSourceCi, requireReleaseIdentity, requireReleaseToolchain } from '../../../.github/scripts/prepare-patch-release'

const source = 'a'.repeat(40)
const run = { id: 1, name: 'CI', head_sha: source, status: 'completed', conclusion: 'success' }
const names = ['lint', 'typecheck', 'test', 'zig-tests', 'windows-native-runtime', ...Array.from({ length: 8 }, (_, i) => `native-${i}`)]
const complete = () => ({ total_count: 13, jobs: names.map(name => ({ name, status: 'completed', conclusion: 'success' })) })

test('the patch producer requires every completed source gate on the exact source', () => {
  expect(() => requireQualifiedSourceCi(source, run, complete())).not.toThrow()
  for (const change of [{ head_sha: 'b'.repeat(40) }, { name: 'CI Failure Issue' }, { status: 'in_progress' }, { conclusion: 'failure' }])
    expect(() => requireQualifiedSourceCi(source, { ...run, ...change }, complete())).toThrow()
})

test('a green workflow cannot hide missing Windows, failed preview or partial job results', () => {
  for (const name of ['lint', 'typecheck', 'test', 'zig-tests', 'windows-native-runtime', 'native-0']) {
    const jobs = complete()
    jobs.jobs.find(job => job.name === name)!.conclusion = 'failure'
    expect(() => requireQualifiedSourceCi(source, run, jobs)).toThrow()
  }
  const missing = complete()
  missing.jobs = missing.jobs.filter(job => job.name !== 'windows-native-runtime')
  expect(() => requireQualifiedSourceCi(source, run, missing)).toThrow()
  const skipped = complete()
  skipped.jobs.find(job => job.name === 'windows-native-runtime')!.conclusion = 'skipped'
  expect(() => requireQualifiedSourceCi(source, run, skipped)).toThrow()
})

test('an unused failure alert may be skipped after all thirteen required checks pass', () => {
  const jobs = complete()
  jobs.jobs.push({ name: 'alert-on-failure', status: 'completed', conclusion: 'skipped' })
  jobs.total_count += 1
  expect(() => requireQualifiedSourceCi(source, run, jobs)).not.toThrow()
})

test('release identity is Chris Breuer and the commit has no coauthor trailer', () => {
  const identity = 'Chris Breuer|chrisbreuer93@gmail.com|Chris Breuer|chrisbreuer93@gmail.com'
  expect(() => requireReleaseIdentity(identity, 'chore: release v0.11.101')).not.toThrow()
  expect(() => requireReleaseIdentity(identity.replaceAll('Chris Breuer', 'github-actions[bot]'), 'chore: release v0.11.101')).toThrow()
  expect(() => requireReleaseIdentity(identity, 'chore: release v0.11.101\n\nCo-authored-by: Agent <agent@example.invalid>')).toThrow()
})

test('patch calculation rejects ambiguous versions rather than choosing another release', () => {
  expect(nextPatchVersion('0.11.100')).toBe('0.11.101')
  for (const version of ['v0.11.100', '0.11.100-beta', '0.11', '', null, '0.11.9007199254740992'])
    expect(() => nextPatchVersion(version)).toThrow()
})


test('the public source guard must come from the exact installed release dependency', () => {
  expect(() => requireReleaseToolchain('0.2.25', '0.2.25')).not.toThrow()
  for (const [declared, installed] of [['^0.2.25', '0.2.25'], ['0.2.24', '0.2.24'], ['0.2.25', '0.2.24'], [undefined, '0.2.25']])
    expect(() => requireReleaseToolchain(declared, installed)).toThrow()
})
