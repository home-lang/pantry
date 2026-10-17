import { expect, test } from 'bun:test'
import { programsForPlatform } from '../src/programs'
import { zigProgramsExpression } from '../src/generate-zig'
import { loadRecipe } from '../scripts/recipe-loader'
import { recipe } from '../src/recipes/git-scm.org'

test('Git keeps its keychain helper on macOS without requiring it on Linux', async () => {
  for (const platform of ['linux-x86-64', 'linux-arm64', 'darwin-arm64', 'darwin-x86-64']) {
    const loaded = (await loadRecipe('git-scm.org', platform, '2.53.0')).recipe
    expect(loaded.programs).toEqual(programsForPlatform(recipe, platform))
    expect(loaded.programs).toContain('git')
    expect(loaded.programs?.includes('git-credential-osxkeychain')).toBe(platform.startsWith('darwin-'))
  }
})

test('program scopes add to the common interface and deduplicate declarations', () => {
  const pkg = { programs: ['common'], platformPrograms: { linux: ['common', 'native'], windows: ['tool.exe'] } }
  expect(programsForPlatform(pkg, 'linux-x86-64')).toEqual(['common', 'native'])
  expect(programsForPlatform(pkg, 'darwin')).toEqual(['common'])
  expect(programsForPlatform(pkg, 'win32')).toEqual(['common', 'tool.exe'])
  expect(programsForPlatform(pkg, '')).toEqual(['common'])
})

test('the native catalog chooses program declarations for its compile target', () => {
  const expression = zigProgramsExpression(recipe)
  expect(expression).toContain('if (@import("builtin").os.tag == .macos)')
  const [macos, other] = expression.split(' else ')
  expect(macos).toContain('git-credential-osxkeychain')
  expect(other).not.toContain('git-credential-osxkeychain')
  expect(other).toContain('"git"')
  expect(() => zigProgramsExpression({ programs: [], platformPrograms: { typo: ['bad'] } } as never)).toThrow('Unsupported program platform')
})
