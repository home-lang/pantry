/**
 * **ninja** - Small build system for use with gyp or CMake
 *
 * @domain `ninja-build.org`
 * @programs `ninja`
 * @version `1.13.2` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ninja-build.org`
 * @homepage https://ninja-build.org/
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ninjabuildorg
 * console.log(pkg.name)        // "ninja"
 * console.log(pkg.description) // "Small build system for use with gyp or CMake"
 * console.log(pkg.programs)    // ["ninja"]
 * console.log(pkg.versions[0]) // "1.13.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ninja-build-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ninjabuildorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'ninja' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ninja-build.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Small build system for use with gyp or CMake' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ninja-build.org/package.yml' as const,
  homepageUrl: 'https://ninja-build.org/' as const,
  githubUrl: 'https://github.com/ninja-build/ninja' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ninja-build.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ninja-build.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ninja-build.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ninja',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.1',
    '1.12.0',
    '1.11.1',
    '1.11.0',
  ] as const,
  aliases: [] as const,
}

export type NinjabuildorgPackage = typeof ninjabuildorgPackage
