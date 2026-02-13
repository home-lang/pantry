/**
 * **arduino-cli** - Arduino command-line interface
 *
 * @domain `arduino.github.io/arduino-cli`
 * @programs `arduino-cli`
 * @version `1.4.1` (24 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install arduino.github.io/arduino-cli`
 * @homepage https://arduino.github.io/arduino-cli/latest/
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.arduinogithubioarduinocli
 * console.log(pkg.name)        // "arduino-cli"
 * console.log(pkg.description) // "Arduino command-line interface"
 * console.log(pkg.programs)    // ["arduino-cli"]
 * console.log(pkg.versions[0]) // "1.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/arduino-github-io/arduino-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const arduinogithubioarduinocliPackage = {
  /**
   * The display name of this package.
   */
  name: 'arduino-cli' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'arduino.github.io/arduino-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Arduino command-line interface' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/arduino.github.io/arduino-cli/package.yml' as const,
  homepageUrl: 'https://arduino.github.io/arduino-cli/latest/' as const,
  githubUrl: 'https://github.com/arduino/arduino-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install arduino.github.io/arduino-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +arduino.github.io/arduino-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install arduino.github.io/arduino-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'arduino-cli',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.1',
    '1.4.0',
    '1.3.1',
    '1.3.0',
    '1.2.2',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.35.3',
    '0.35.2',
    '0.35.1',
    '0.35.0',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.1',
    '0.33.0',
    '0.32.3',
    '0.32.2',
  ] as const,
  aliases: [] as const,
}

export type ArduinogithubioarduinocliPackage = typeof arduinogithubioarduinocliPackage
