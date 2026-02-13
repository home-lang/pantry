/**
 * **aserver** - Provides audio and MIDI functionality to the Linux operating system
 *
 * @domain `alsa-project.org/alsa-lib`
 * @programs `aserver`
 * @version `1.2.15.3` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install alsa-project.org/alsa-lib`
 * @homepage https://www.alsa-project.org/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.alsaprojectorgalsalib
 * console.log(pkg.name)        // "aserver"
 * console.log(pkg.description) // "Provides audio and MIDI functionality to the Li..."
 * console.log(pkg.programs)    // ["aserver"]
 * console.log(pkg.versions[0]) // "1.2.15.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/alsa-project-org/alsa-lib.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const alsaprojectorgalsalibPackage = {
  /**
   * The display name of this package.
   */
  name: 'aserver' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'alsa-project.org/alsa-lib' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Provides audio and MIDI functionality to the Linux operating system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/alsa-project.org/alsa-lib/package.yml' as const,
  homepageUrl: 'https://www.alsa-project.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install alsa-project.org/alsa-lib' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +alsa-project.org/alsa-lib -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install alsa-project.org/alsa-lib' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'aserver',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.15.3',
    '1.2.15.2',
    '1.2.15.1',
    '1.2.14',
    '1.2.13',
    '1.2.12',
    '1.2.11',
    '1.2.10',
    '1.2.9',
  ] as const,
  aliases: [] as const,
}

export type AlsaprojectorgalsalibPackage = typeof alsaprojectorgalsalibPackage
