/**
 * **sensors** - Tools for monitoring the temperatures, voltages, and fans
 *
 * @domain `github.com/lm-sensors/lm-sensors`
 * @programs `sensors`
 * @version `3.6.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/lm-sensors/lm-sensors`
 * @homepage https://hwmon.wiki.kernel.org/
 * @buildDependencies `gnu.org/bison`, `github.com/westes/flex`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlmsensorslmsensors
 * console.log(pkg.name)        // "sensors"
 * console.log(pkg.description) // "Tools for monitoring the temperatures, voltages..."
 * console.log(pkg.programs)    // ["sensors"]
 * console.log(pkg.versions[0]) // "3.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/lm-sensors/lm-sensors.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lmsensorsPackage = {
  /**
   * The display name of this package.
   */
  name: 'sensors' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/lm-sensors/lm-sensors' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Tools for monitoring the temperatures, voltages, and fans' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lm-sensors/lm-sensors/package.yml' as const,
  homepageUrl: 'https://hwmon.wiki.kernel.org/' as const,
  githubUrl: 'https://github.com/lm-sensors/lm-sensors' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/lm-sensors/lm-sensors' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/lm-sensors/lm-sensors -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/lm-sensors/lm-sensors' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sensors',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/bison',
    'github.com/westes/flex',
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.6.0',
  ] as const,
  aliases: [] as const,
}

export type LmsensorsPackage = typeof lmsensorsPackage
