/**
 * **robot** - Generic automation framework for acceptance testing and RPA
 *
 * @domain `robotframework.org`
 * @programs `robot`
 * @version `7.4.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install robotframework.org`
 * @homepage https://robotframework.org/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@^3`, `cryptography.io`, `libsodium.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.robotframeworkorg
 * console.log(pkg.name)        // "robot"
 * console.log(pkg.description) // "Generic automation framework for acceptance tes..."
 * console.log(pkg.programs)    // ["robot"]
 * console.log(pkg.versions[0]) // "7.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/robotframework-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const robotframeworkorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'robot' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'robotframework.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generic automation framework for acceptance testing and RPA' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/robotframework.org/package.yml' as const,
  homepageUrl: 'https://robotframework.org/' as const,
  githubUrl: 'https://github.com/robotframework/robotframework' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install robotframework.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +robotframework.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install robotframework.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'robot',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@^3',
    'cryptography.io',
    'libsodium.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.4.1',
    '7.4.0',
    '7.3.2',
    '7.3.1',
    '7.3.0',
    '7.2.2',
  ] as const,
  aliases: [] as const,
}

export type RobotframeworkorgPackage = typeof robotframeworkorgPackage
