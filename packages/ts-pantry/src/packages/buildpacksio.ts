/**
 * **pack** - CLI for building apps using Cloud Native Buildpacks
 *
 * @domain `buildpacks.io`
 * @programs `pack`
 * @version `0.40.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install buildpacks.io`
 * @homepage https://buildpacks.io
 * @buildDependencies `go.dev@~1.24` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.buildpacksio
 * console.log(pkg.name)        // "pack"
 * console.log(pkg.description) // "CLI for building apps using Cloud Native Buildp..."
 * console.log(pkg.programs)    // ["pack"]
 * console.log(pkg.versions[0]) // "0.40.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/buildpacks-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const buildpacksioPackage = {
  /**
  * The display name of this package.
  */
  name: 'pack' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'buildpacks.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CLI for building apps using Cloud Native Buildpacks' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/buildpacks.io/package.yml' as const,
  homepageUrl: 'https://buildpacks.io' as const,
  githubUrl: 'https://github.com/buildpacks/pack' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install buildpacks.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +buildpacks.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install buildpacks.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pack',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.24',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.40.0',
    '0.39.1',
    '0.39.0',
    '0.38.2',
    '0.38.1',
    '0.38.0',
    '0.37.0',
    '0.36.4',
    '0.36.3',
    '0.36.2',
    '0.36.1',
    '0.36.0',
    '0.35.1',
    '0.35.0',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.2',
  ] as const,
  aliases: [] as const,
}

export type BuildpacksioPackage = typeof buildpacksioPackage
