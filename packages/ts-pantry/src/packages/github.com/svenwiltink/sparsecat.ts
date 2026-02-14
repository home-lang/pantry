/**
 * **sparsecat** - CLI tool that reduces bandwidth usage when transmitting sparse files.
 *
 * @domain `github.com/svenwiltink/sparsecat`
 * @programs `sparsecat`
 * @version `1.0.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/svenwiltink/sparsecat`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsvenwiltinksparsecat
 * console.log(pkg.name)        // "sparsecat"
 * console.log(pkg.description) // "CLI tool that reduces bandwidth usage when tran..."
 * console.log(pkg.programs)    // ["sparsecat"]
 * console.log(pkg.versions[0]) // "1.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/svenwiltink/sparsecat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sparsecatPackage = {
  /**
  * The display name of this package.
  */
  name: 'sparsecat' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/svenwiltink/sparsecat' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CLI tool that reduces bandwidth usage when transmitting sparse files.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/svenwiltink/sparsecat/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/svenwiltink/sparsecat' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/svenwiltink/sparsecat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/svenwiltink/sparsecat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/svenwiltink/sparsecat' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sparsecat',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.1',
  ] as const,
  aliases: [] as const,
}

export type SparsecatPackage = typeof sparsecatPackage
