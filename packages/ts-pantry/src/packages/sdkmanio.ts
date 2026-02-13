/**
 * **sdkman-init.sh** - The SDKMAN! Command Line Interface
 *
 * @domain `sdkman.io`
 * @programs `sdkman-init.sh`
 * @version `5.20.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sdkman.io`
 * @homepage https://sdkman.io
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sdkmanio
 * console.log(pkg.name)        // "sdkman-init.sh"
 * console.log(pkg.description) // "The SDKMAN! Command Line Interface"
 * console.log(pkg.programs)    // ["sdkman-init.sh"]
 * console.log(pkg.versions[0]) // "5.20.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sdkman-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sdkmanioPackage = {
  /**
   * The display name of this package.
   */
  name: 'sdkman-init.sh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sdkman.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The SDKMAN! Command Line Interface' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sdkman.io/package.yml' as const,
  homepageUrl: 'https://sdkman.io' as const,
  githubUrl: 'https://github.com/sdkman/sdkman-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sdkman.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sdkman.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sdkman.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sdkman-init.sh',
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
    '5.20.0',
    '5.19.0',
    '5.18.2',
  ] as const,
  aliases: [] as const,
}

export type SdkmanioPackage = typeof sdkmanioPackage
