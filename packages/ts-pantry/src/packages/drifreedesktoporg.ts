/**
 * **libdrm** - pkgx package
 *
 * @domain `dri.freedesktop.org`
 * @version `2.4.131` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dri.freedesktop.org`
 * @dependencies `x.org/pciaccess`
 * @buildDependencies `mesonbuild.com`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.drifreedesktoporg
 * console.log(pkg.name)        // "libdrm"
 * console.log(pkg.versions[0]) // "2.4.131" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dri-freedesktop-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const drifreedesktoporgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libdrm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'dri.freedesktop.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dri.freedesktop.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install dri.freedesktop.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dri.freedesktop.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dri.freedesktop.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/pciaccess',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.131',
    '2.4.130',
    '2.4.129',
    '2.4.128',
    '2.4.127',
    '2.4.126',
    '2.4.125',
    '2.4.124',
    '2.4.123',
    '2.4.122',
    '2.4.121',
    '2.4.120',
    '2.4.119',
    '2.4.118',
    '2.4.117',
    '2.4.116',
    '2.4.100',
  ] as const,
  aliases: [] as const,
}

export type DrifreedesktoporgPackage = typeof drifreedesktoporgPackage
