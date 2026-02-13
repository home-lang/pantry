/**
 * **pio** - Your Gateway to Embedded Software Development Excellence :alien:
 *
 * @domain `github.com/siiptuo/pio`
 * @programs `pio`
 * @version `0.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/siiptuo/pio`
 * @homepage https://platformio.org/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsiiptuopio
 * console.log(pkg.name)        // "pio"
 * console.log(pkg.description) // "Your Gateway to Embedded Software Development E..."
 * console.log(pkg.programs)    // ["pio"]
 * console.log(pkg.versions[0]) // "0.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/siiptuo/pio.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pioPackage = {
  /**
   * The display name of this package.
   */
  name: 'pio' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/siiptuo/pio' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Your Gateway to Embedded Software Development Excellence :alien:' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/siiptuo/pio/package.yml' as const,
  homepageUrl: 'https://platformio.org/' as const,
  githubUrl: 'https://github.com/platformio/platformio-core' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/siiptuo/pio' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/siiptuo/pio -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/siiptuo/pio' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pio',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.0',
  ] as const,
  aliases: [] as const,
}

export type PioPackage = typeof pioPackage
