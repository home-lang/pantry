/**
 * **gost3411-2012** - GOST R 34.11-2012: RFC-6986 cryptographic hash function
 *
 * @domain `github.com/adegtyarev/streebog`
 * @programs `gost3411-2012`
 * @version `0.13.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/adegtyarev/streebog`
 * @homepage https://www.streebog.net/
 * @buildDependencies `linux:gnu.org/patch` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomadegtyarevstreebog
 * console.log(pkg.name)        // "gost3411-2012"
 * console.log(pkg.description) // "GOST R 34.11-2012: RFC-6986 cryptographic hash ..."
 * console.log(pkg.programs)    // ["gost3411-2012"]
 * console.log(pkg.versions[0]) // "0.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/adegtyarev/streebog.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const streebogPackage = {
  /**
   * The display name of this package.
   */
  name: 'gost3411-2012' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/adegtyarev/streebog' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GOST R 34.11-2012: RFC-6986 cryptographic hash function' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/adegtyarev/streebog/package.yml' as const,
  homepageUrl: 'https://www.streebog.net/' as const,
  githubUrl: 'https://github.com/adegtyarev/streebog' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/adegtyarev/streebog' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/adegtyarev/streebog -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/adegtyarev/streebog' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gost3411-2012',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.13.0',
  ] as const,
  aliases: [] as const,
}

export type StreebogPackage = typeof streebogPackage
