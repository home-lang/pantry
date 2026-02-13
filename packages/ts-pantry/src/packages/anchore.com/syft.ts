/**
 * **syft** - CLI tool and library for generating a Software Bill of Materials from container images and filesystems
 *
 * @domain `anchore.com/syft`
 * @programs `syft`
 * @version `1.40.1` (57 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install anchore.com/syft`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.anchorecomsyft
 * console.log(pkg.name)        // "syft"
 * console.log(pkg.description) // "CLI tool and library for generating a Software ..."
 * console.log(pkg.programs)    // ["syft"]
 * console.log(pkg.versions[0]) // "1.40.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/anchore-com/syft.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const anchorecomsyftPackage = {
  /**
   * The display name of this package.
   */
  name: 'syft' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'anchore.com/syft' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI tool and library for generating a Software Bill of Materials from container images and filesystems' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/anchore.com/syft/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/anchore/syft' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install anchore.com/syft' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +anchore.com/syft -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install anchore.com/syft' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'syft',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.40.1',
    '1.40.0',
    '1.39.0',
    '1.38.2',
    '1.38.0',
    '1.37.0',
    '1.36.0',
    '1.34.2',
    '1.34.1',
    '1.33.0',
    '1.32.0',
    '1.31.0',
    '1.30.0',
    '1.29.1',
    '1.29.0',
    '1.28.0',
    '1.27.1',
    '1.27.0',
    '1.26.1',
    '1.26.0',
    '1.25.1',
    '1.25.0',
    '1.24.0',
    '1.23.1',
    '1.23.0',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.0',
    '1.18.1',
    '1.18.0',
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.0',
    '1.12.2',
    '1.11.1',
    '1.11.0',
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.105.1',
    '0.105.0',
  ] as const,
  aliases: [] as const,
}

export type AnchorecomsyftPackage = typeof anchorecomsyftPackage
