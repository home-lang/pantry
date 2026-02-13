/**
 * **csvdiff** - A fast diff tool for comparing csv files
 *
 * @domain `github.com/aswinkarthik/csvdiff`
 * @programs `csvdiff`
 * @version `1.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/aswinkarthik/csvdiff`
 * @homepage https://aswinkarthik.github.io/csvdiff/
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomaswinkarthikcsvdiff
 * console.log(pkg.name)        // "csvdiff"
 * console.log(pkg.description) // "A fast diff tool for comparing csv files"
 * console.log(pkg.programs)    // ["csvdiff"]
 * console.log(pkg.versions[0]) // "1.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/aswinkarthik/csvdiff.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const csvdiffPackage = {
  /**
   * The display name of this package.
   */
  name: 'csvdiff' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/aswinkarthik/csvdiff' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A fast diff tool for comparing csv files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/aswinkarthik/csvdiff/package.yml' as const,
  homepageUrl: 'https://aswinkarthik.github.io/csvdiff/' as const,
  githubUrl: 'https://github.com/aswinkarthik/csvdiff' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/aswinkarthik/csvdiff' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/aswinkarthik/csvdiff -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/aswinkarthik/csvdiff' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'csvdiff',
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
    '1.4.0',
  ] as const,
  aliases: [] as const,
}

export type CsvdiffPackage = typeof csvdiffPackage
