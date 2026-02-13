/**
 * **luv** - Bare libuv bindings for lua
 *
 * @domain `github.com/luvit/luv`
 * @version `1.45.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/luvit/luv`
 * @dependencies `libuv.org`
 * @buildDependencies `cmake.org`, `lua.org`, `luajit.org`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomluvitluv
 * console.log(pkg.name)        // "luv"
 * console.log(pkg.description) // "Bare libuv bindings for lua"
 * console.log(pkg.versions[0]) // "1.45.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/luvit/luv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const luvPackage = {
  /**
   * The display name of this package.
   */
  name: 'luv' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/luvit/luv' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Bare libuv bindings for lua' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/luvit/luv/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/luvit/luv' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/luvit/luv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/luvit/luv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/luvit/luv' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libuv.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'lua.org',
    'luajit.org',
    'linux:curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.45.0',
  ] as const,
  aliases: [] as const,
}

export type LuvPackage = typeof luvPackage
