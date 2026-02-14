/**
 * **luajit** - Mirror of the LuaJIT git repository
 *
 * @domain `luajit.org`
 * @programs `luajit`, `luajit-{{version.marketing}}.`
 * @version `2.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install luajit.org`
 * @homepage http://luajit.org
 * @buildDependencies `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.luajitorg
 * console.log(pkg.name)        // "luajit"
 * console.log(pkg.description) // "Mirror of the LuaJIT git repository"
 * console.log(pkg.programs)    // ["luajit", "luajit-{{version.marketing}}."]
 * console.log(pkg.versions[0]) // "2.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/luajit-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const luajitorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'luajit' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'luajit.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Mirror of the LuaJIT git repository' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/luajit.org/package.yml' as const,
  homepageUrl: 'http://luajit.org' as const,
  githubUrl: 'https://github.com/LuaJIT/LuaJIT' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install luajit.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +luajit.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install luajit.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'luajit',
    'luajit-{{version.marketing}}.',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.0',
  ] as const,
  aliases: [] as const,
}

export type LuajitorgPackage = typeof luajitorgPackage
