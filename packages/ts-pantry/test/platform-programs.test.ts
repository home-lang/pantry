import { expect, test } from 'bun:test'
import { programsForPlatform } from '../src/programs'
import { zigProgramsExpression } from '../src/generate-zig'
import { loadRecipe } from '../scripts/recipe-loader'
import { recipe } from '../src/recipes/git-scm.org'
import { recipe as bunRecipe } from '../src/recipes/bun.com'
import { bunPackage } from '../src/packages/buncom'

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

test('Bun declares the executable its Windows archive actually supplies', async () => {
  expect(programsForPlatform(bunPackage, 'windows-x86-64')).toEqual(['bun.exe'])
  expect(programsForPlatform(bunRecipe, 'windows-x86-64')).toEqual(['bun.exe'])
  expect(programsForPlatform(bunRecipe, 'linux-x86-64')).toEqual(['bun', 'bunx'])
  const loaded = (await loadRecipe('bun.com', 'windows-x86-64', '1.4.3')).recipe
  expect(loaded.programs).toEqual(['bun.exe'])
  expect(zigProgramsExpression(bunPackage)).toContain('if (@import("builtin").os.tag == .windows) &[_][]const u8{ "bun.exe" }')
})

test('JDK 26 removal of jrunscript changes only the executable contract for newer JDKs', async () => {
  for (const version of ['17.0.20.8', '25.0.0.36', '26.0.0.35', '27.0.0.35']) {
    const loaded = (await loadRecipe('openjdk.org', 'linux-x86-64', version)).recipe
    expect(loaded.programs).toContain('java')
    expect(loaded.programs).toContain('javac')
    expect(loaded.programs?.includes('jrunscript')).toBe(Number(version.split('.')[0]) < 26)
  }
})

test('program release boundaries retain strict validation when the version is unknown', () => {
  const pkg = { programs: ['common', 'new', 'removed'], programVersions: { new: { since: 2 }, removed: { before: 3 } } }
  expect(programsForPlatform(pkg, 'linux', '1.9')).toEqual(['common', 'removed'])
  expect(programsForPlatform(pkg, 'linux', '2.0')).toEqual(['common', 'new', 'removed'])
  expect(programsForPlatform(pkg, 'linux', '3.0')).toEqual(['common', 'new'])
  expect(programsForPlatform(pkg, 'linux', 'unknown')).toEqual(pkg.programs)
  expect(programsForPlatform(pkg, 'linux')).toEqual(pkg.programs)
})
