/**
 * **xauth** - X.Org Applications: xauth
 *
 * @domain `x.org/xauth`
 * @programs `xauth`
 * @version `1.1.5` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xauth`
 * @homepage https://www.x.org/
 * @dependencies `x.org/x11`, `x.org/exts`, `x.org/xau`, ... (+3 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `linux:gnu.org/gcc`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxauth
 * console.log(pkg.name)        // "xauth"
 * console.log(pkg.description) // "X.Org Applications: xauth"
 * console.log(pkg.programs)    // ["xauth"]
 * console.log(pkg.versions[0]) // "1.1.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xauth.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxauthPackage = {
  /**
   * The display name of this package.
   */
  name: 'xauth' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xauth' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'X.Org Applications: xauth' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xauth/package.yml' as const,
  homepageUrl: 'https://www.x.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xauth' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xauth -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xauth' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xauth',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'x.org/x11',
    'x.org/exts',
    'x.org/xau',
    'x.org/xmu',
    'linux:x.org/xcb',
    'linux:x.org/xdmcp',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/gcc',
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
  ] as const,
  aliases: [] as const,
}

export type XorgxauthPackage = typeof xorgxauthPackage
