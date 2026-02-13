/**
 * **libpthread-stubs** - pkgx package
 *
 * @domain `x.org/libpthread-stubs`
 * @version `0.5.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/libpthread-stubs`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorglibpthreadstubs
 * console.log(pkg.name)        // "libpthread-stubs"
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/libpthread-stubs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorglibpthreadstubsPackage = {
  /**
   * The display name of this package.
   */
  name: 'libpthread-stubs' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/libpthread-stubs' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/libpthread-stubs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/libpthread-stubs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/libpthread-stubs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/libpthread-stubs' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.0',
    '0.4.0',
  ] as const,
  aliases: [] as const,
}

export type XorglibpthreadstubsPackage = typeof xorglibpthreadstubsPackage
