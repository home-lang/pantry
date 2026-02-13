/**
 * **lua** - Powerful, lightweight programming language
 *
 * @domain `lua.org`
 * @programs `lua`, `luac`
 * @version `5.5.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lua.org`
 * @homepage https://www.lua.org/
 * @dependencies `gnu.org/readline`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.luaorg
 * console.log(pkg.name)        // "lua"
 * console.log(pkg.description) // "Powerful, lightweight programming language"
 * console.log(pkg.programs)    // ["lua", "luac"]
 * console.log(pkg.versions[0]) // "5.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lua-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const luaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'lua' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lua.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Powerful, lightweight programming language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lua.org/package.yml' as const,
  homepageUrl: 'https://www.lua.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lua.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lua.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lua.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lua',
    'luac',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/readline',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.5.0',
    '5.4.8',
    '5.4.7',
    '5.4.6',
    '5.4.4',
  ] as const,
  aliases: [] as const,
}

export type LuaorgPackage = typeof luaorgPackage
