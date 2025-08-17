import { describe, expect, it } from 'bun:test'
import { getAvailableVersions, getLatestVersion, resolvePackageName } from '../src/package-resolution'

describe('Git package resolution', () => {
  it('should resolve git to git-scm.org', () => {
    expect(resolvePackageName('git')).toBe('git-scm.org')
  })

  it('should resolve git-scm.com to git-scm.org', () => {
    expect(resolvePackageName('git-scm.com')).toBe('git-scm.org')
  })

  it('should get the latest version of git', () => {
    const latestVersion = getLatestVersion('git')
    expect(latestVersion).toBeTruthy()
    expect(typeof latestVersion).toBe('string')
  })

  it('should get available versions for git', () => {
    const versions = getAvailableVersions('git')
    expect(versions.length).toBeGreaterThan(0)
    expect(Array.isArray(versions)).toBe(true)
  })

  it('should get the same versions for git, git-scm.com, and git-scm.org', () => {
    const gitVersions = getAvailableVersions('git')
    const gitScmComVersions = getAvailableVersions('git-scm.com')
    const gitScmOrgVersions = getAvailableVersions('git-scm.org')

    expect(gitVersions).toEqual(gitScmOrgVersions)
    expect(gitScmComVersions).toEqual(gitScmOrgVersions)
  })
})
