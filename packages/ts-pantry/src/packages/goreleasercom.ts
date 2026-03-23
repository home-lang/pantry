/**
 * **goreleaser** - Deliver Go binaries as fast and easily as possible
 *
 * @domain `goreleaser.com`
 * @programs `goreleaser`
 * @version `2.14.3` (60 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install goreleaser.com`
 * @homepage https://goreleaser.com/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.goreleasercom
 * console.log(pkg.name)        // "goreleaser"
 * console.log(pkg.description) // "Deliver Go binaries as fast and easily as possible"
 * console.log(pkg.programs)    // ["goreleaser"]
 * console.log(pkg.versions[0]) // "2.14.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/goreleaser-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const goreleasercomPackage = {
  /**
  * The display name of this package.
  */
  name: 'goreleaser' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'goreleaser.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Deliver Go binaries as fast and easily as possible' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/goreleaser.com/package.yml' as const,
  homepageUrl: 'https://goreleaser.com/' as const,
  githubUrl: 'https://github.com/goreleaser/goreleaser' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install goreleaser.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +goreleaser.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install goreleaser.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'goreleaser',
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.14.3',
    '2.14.2',
    '2.14.1',
    '2.14.0',
    '2.13.3',
    '2.13.2',
    '2.13.1',
    '2.13.0',
    '2.12.7',
    '2.12.6',
    '2.12.5',
    '2.12.4',
    '2.12.3',
    '2.12.2',
    '2.12.1',
    '2.12.0',
    '2.11.2',
    '2.11.1',
    '2.11.0',
    '2.10.2',
  ] as const,
  aliases: [] as const,
}

export type GoreleasercomPackage = typeof goreleasercomPackage
