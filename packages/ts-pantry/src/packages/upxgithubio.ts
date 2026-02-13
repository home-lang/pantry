/**
 * **upx** - UPX - the Ultimate Packer for eXecutables
 *
 * @domain `upx.github.io`
 * @programs `upx`
 * @version `5.1.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install upx.github.io`
 * @homepage https://upx.github.io/
 * @dependencies `zlib.net`
 * @buildDependencies `cmake.org`, `oberhumer.com/ucl` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.upxgithubio
 * console.log(pkg.name)        // "upx"
 * console.log(pkg.description) // "UPX - the Ultimate Packer for eXecutables"
 * console.log(pkg.programs)    // ["upx"]
 * console.log(pkg.versions[0]) // "5.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/upx-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const upxgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'upx' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'upx.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'UPX - the Ultimate Packer for eXecutables' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/upx.github.io/package.yml' as const,
  homepageUrl: 'https://upx.github.io/' as const,
  githubUrl: 'https://github.com/upx/upx' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install upx.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +upx.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install upx.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'upx',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
    'oberhumer.com/ucl',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.0',
    '5.0.2',
    '5.0.1',
    '5.0.0',
    '4.2.4',
  ] as const,
  aliases: [] as const,
}

export type UpxgithubioPackage = typeof upxgithubioPackage
