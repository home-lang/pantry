/**
 * **oras** - OCI registry client - managing content like artifacts, images, packages
 *
 * @domain `oras.land`
 * @programs `oras`
 * @version `1.3.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install oras.land`
 * @homepage https://oras.land
 * @buildDependencies `go.dev@^1.19`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.orasland
 * console.log(pkg.name)        // "oras"
 * console.log(pkg.description) // "OCI registry client - managing content like art..."
 * console.log(pkg.programs)    // ["oras"]
 * console.log(pkg.versions[0]) // "1.3.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/oras-land.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install oras.land' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +oras.land -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install oras.land' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.16.0',
    '0.15.1',
    '0.15.0',
    '0.14.1',
    '0.14.0',
    '0.13.0',
    '0.12.0',
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.1',
    '0.8.0',
    '0.7.0',
    '0.6.0',
    '0.5.0',
    '0.4.0',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type OraslandPackage = typeof oraslandPackage
