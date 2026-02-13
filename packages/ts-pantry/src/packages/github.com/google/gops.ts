/**
 * **gops** - A tool to list and diagnose Go processes currently running on your system
 *
 * @domain `github.com/google/gops`
 * @programs `gops`
 * @version `0.3.29` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/google/gops`
 * @dependencies `go.dev`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgooglegops
 * console.log(pkg.name)        // "gops"
 * console.log(pkg.description) // "A tool to list and diagnose Go processes curren..."
 * console.log(pkg.programs)    // ["gops"]
 * console.log(pkg.versions[0]) // "0.3.29" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/google/gops.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gopsPackage = {
  /**
   * The display name of this package.
   */
  name: 'gops' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/google/gops' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool to list and diagnose Go processes currently running on your system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/gops/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/gops' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/google/gops' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/google/gops -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/google/gops' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gops',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'go.dev',
  ] as const,
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
    '0.3.29',
    '0.3.28',
    '0.3.27',
  ] as const,
  aliases: [] as const,
}

export type GopsPackage = typeof gopsPackage
