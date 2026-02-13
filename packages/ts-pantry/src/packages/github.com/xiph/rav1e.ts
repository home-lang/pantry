/**
 * **rav1e** - Fastest and safest AV1 video encoder
 *
 * @domain `github.com/xiph/rav1e`
 * @programs `rav1e`
 * @version `0.8.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/xiph/rav1e`
 * @dependencies `nasm.us^2.14.02`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomxiphrav1e
 * console.log(pkg.name)        // "rav1e"
 * console.log(pkg.description) // "Fastest and safest AV1 video encoder"
 * console.log(pkg.programs)    // ["rav1e"]
 * console.log(pkg.versions[0]) // "0.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/xiph/rav1e.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rav1ePackage = {
  /**
   * The display name of this package.
   */
  name: 'rav1e' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/xiph/rav1e' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fastest and safest AV1 video encoder' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/xiph/rav1e/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/xiph/rav1e' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/xiph/rav1e' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/xiph/rav1e -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/xiph/rav1e' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rav1e',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nasm.us^2.14.02',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.1',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.6',
    '0.6.5',
    '0.6.4',
    '0.6.3',
  ] as const,
  aliases: [] as const,
}

export type Rav1ePackage = typeof rav1ePackage
