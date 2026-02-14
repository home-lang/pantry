/**
 * **oras** - OCI registry client - managing content like artifacts, images, packages
 *
 * @domain `oras.land`
 * @programs `oras`
 * @version `1.3.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install oras.land`
 * @homepage https://oras.land
 * @buildDependencies `go.dev@^1.19`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.orasland
 * console.log(pkg.name)        // "oras"
 * console.log(pkg.description) // "OCI registry client - managing content like art..."
 * console.log(pkg.programs)    // ["oras"]
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/oras-land.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const oraslandPackage = {
  /**
  * The display name of this package.
  */
  name: 'oras' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'oras.land' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'OCI registry client - managing content like artifacts, images, packages' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/oras.land/package.yml' as const,
  homepageUrl: 'https://oras.land' as const,
  githubUrl: 'https://github.com/oras-project/oras' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install oras.land' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +oras.land -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install oras.land' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'oras',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
    'goreleaser.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.0',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type OraslandPackage = typeof oraslandPackage
