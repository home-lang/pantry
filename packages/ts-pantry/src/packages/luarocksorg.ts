/**
 * **luarocks** - LuaRocks is the package manager for the Lua programming language.
 *
 * @domain `luarocks.org`
 * @programs `luarocks`, `luarocks-admin`
 * @version `3.13.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install luarocks.org`
 * @homepage https://luarocks.org/
 * @dependencies `lua.org`, `info-zip.org/unzip`
 * @buildDependencies `gnu.org/make@^4`, `gnu.org/sed@^4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.luarocksorg
 * console.log(pkg.name)        // "luarocks"
 * console.log(pkg.description) // "LuaRocks is the package manager for the Lua pro..."
 * console.log(pkg.programs)    // ["luarocks", "luarocks-admin"]
 * console.log(pkg.versions[0]) // "3.13.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/luarocks-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const luarocksorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'luarocks' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'luarocks.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'LuaRocks is the package manager for the Lua programming language.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/luarocks.org/package.yml' as const,
  homepageUrl: 'https://luarocks.org/' as const,
  githubUrl: 'https://github.com/luarocks/luarocks' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install luarocks.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +luarocks.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install luarocks.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'luarocks',
    'luarocks-admin',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'lua.org',
    'info-zip.org/unzip',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make@^4',
    'gnu.org/sed@^4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.13.0',
    '3.12.2',
    '3.12.1',
    '3.12.0',
    '3.11.1',
    '3.11.0',
    '3.10.0',
    '3.9.2',
    '3.9.1',
    '3.9.0',
    '3.8.0',
    '3.7.0',
    '3.6.0',
    '3.5.0',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.1',
    '3.2.0',
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.0',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.0',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.13',
    '2.0.12',
    '2.0.11',
    '2.0.10',
    '2.0.9',
    '2.0.8',
    '2.0.7.1',
    '2.0.7',
    '2.0.6',
    '2.0.5',
    '2.0.4.1',
  ] as const,
  aliases: [] as const,
}

export type LuarocksorgPackage = typeof luarocksorgPackage
