/**
 * **gomarkdoc** - Generate markdown documentation for Go (golang) code
 *
 * @domain `github.com/princjef/gomarkdoc`
 * @programs `gomarkdoc`
 * @version `1.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/princjef/gomarkdoc`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomprincjefgomarkdoc
 * console.log(pkg.name)        // "gomarkdoc"
 * console.log(pkg.description) // "Generate markdown documentation for Go (golang)..."
 * console.log(pkg.programs)    // ["gomarkdoc"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/princjef/gomarkdoc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gomarkdocPackage = {
  /**
  * The display name of this package.
  */
  name: 'gomarkdoc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/princjef/gomarkdoc' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Generate markdown documentation for Go (golang) code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/princjef/gomarkdoc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/princjef/gomarkdoc' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/princjef/gomarkdoc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/princjef/gomarkdoc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/princjef/gomarkdoc' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gomarkdoc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type GomarkdocPackage = typeof gomarkdocPackage
