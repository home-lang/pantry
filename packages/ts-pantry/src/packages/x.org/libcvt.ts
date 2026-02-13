/**
 * **cvt** - VESA CVT standard timing modelines generator
 *
 * @domain `x.org/libcvt`
 * @programs `cvt`
 * @version `0.1.3` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/libcvt`
 * @homepage https://www.x.org
 * @dependencies `x.org/x11^1`, `x.org/exts`, `x.org/protocol`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorglibcvt
 * console.log(pkg.name)        // "cvt"
 * console.log(pkg.description) // "VESA CVT standard timing modelines generator"
 * console.log(pkg.programs)    // ["cvt"]
 * console.log(pkg.versions[0]) // "0.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/libcvt.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorglibcvtPackage = {
  /**
   * The display name of this package.
   */
  name: 'cvt' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/libcvt' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'VESA CVT standard timing modelines generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/libcvt/package.yml' as const,
  homepageUrl: 'https://www.x.org' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/libcvt' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/libcvt -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/libcvt' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cvt',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/x11^1',
    'x.org/exts',
    'x.org/protocol',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.3',
    '0.1.2',
  ] as const,
  aliases: [] as const,
}

export type XorglibcvtPackage = typeof xorglibcvtPackage
