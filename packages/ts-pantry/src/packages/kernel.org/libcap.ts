/**
 * **libcap** - pkgx package
 *
 * @domain `kernel.org/libcap`
 * @programs `capsh`, `getcap`, `getpcaps`, `setcap`
 * @version `1.2.77` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kernel.org/libcap`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kernelorglibcap
 * console.log(pkg.name)        // "libcap"
 * console.log(pkg.programs)    // ["capsh", "getcap", ...]
 * console.log(pkg.versions[0]) // "1.2.77" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kernel-org/libcap.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kernelorglibcapPackage = {
  /**
   * The display name of this package.
   */
  name: 'libcap' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'kernel.org/libcap' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kernel.org/libcap/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install kernel.org/libcap' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kernel.org/libcap -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kernel.org/libcap' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'capsh',
    'getcap',
    'getpcaps',
    'setcap',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.77',
    '1.2.76',
    '1.2.75',
    '1.2.74',
    '1.2.73',
  ] as const,
  aliases: [] as const,
}

export type KernelorglibcapPackage = typeof kernelorglibcapPackage
