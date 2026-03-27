/**
 * **sdkman-init.sh** - The SDKMAN! Command Line Interface
 *
 * @domain `sdkman.io`
 * @programs `sdkman-init.sh`
 * @version `5.22.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sdkman.io`
 * @homepage https://sdkman.io
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sdkmanio
 * console.log(pkg.name)        // "sdkman-init.sh"
 * console.log(pkg.description) // "The SDKMAN! Command Line Interface"
 * console.log(pkg.programs)    // ["sdkman-init.sh"]
 * console.log(pkg.versions[0]) // "5.22.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sdkman-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sdkman.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sdkman.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install sdkman.io' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '5.22.2',
    '5.22.1',
    '5.22.0',
    '5.21.0',
    '5.20.0',
    '5.19.0',
    '5.18.2',
    '5.18.1',
    '5.18.0',
    '5.17.0',
    '5.16.1',
    '5.16.0',
    '5.15.0',
    '5.14.3',
    '5.14.2',
    '5.14.1',
    '5.14.0',
    '5.13.2',
    '5.13.1',
    '5.13.0',
    '5.12.4',
    '5.12.3',
    '5.12.2',
    '5.12.1',
    '5.12.0',
    '5.11.7',
    '5.11.6',
    '5.11.5',
    '5.11.4',
    '5.11.3',
    '5.11.2',
    '5.11.1',
    '5.11.0',
    '5.10.0',
    '5.9.2',
    '5.9.1',
    '5.9.0',
    '5.8.5',
    '5.8.4',
  ] as const,
  aliases: [] as const,
}

export type SdkmanioPackage = typeof sdkmanioPackage
