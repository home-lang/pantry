/**
 * **s5cmd** - Parallel S3 and local filesystem execution tool.
 *
 * @domain `github.com/peak/s5cmd`
 * @programs `s5cmd`
 * @version `2.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/peak/s5cmd`
 * @buildDependencies `go.dev@~1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompeaks5cmd
 * console.log(pkg.name)        // "s5cmd"
 * console.log(pkg.description) // "Parallel S3 and local filesystem execution tool."
 * console.log(pkg.programs)    // ["s5cmd"]
 * console.log(pkg.versions[0]) // "2.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/peak/s5cmd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const s5cmdPackage = {
  /**
   * The display name of this package.
   */
  name: 's5cmd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/peak/s5cmd' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Parallel S3 and local filesystem execution tool.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peak/s5cmd/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/peak/s5cmd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/peak/s5cmd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/peak/s5cmd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/peak/s5cmd' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    's5cmd',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.0',
  ] as const,
  aliases: [] as const,
}

export type S5cmdPackage = typeof s5cmdPackage
