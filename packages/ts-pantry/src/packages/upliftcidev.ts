/**
 * **uplift** - Semantic versioning the easy way. Powered by Conventional Commits. Built for use with CI.
 *
 * @domain `upliftci.dev`
 * @programs `uplift`
 * @version `2.26.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install upliftci.dev`
 * @homepage https://upliftci.dev
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.upliftcidev
 * console.log(pkg.name)        // "uplift"
 * console.log(pkg.description) // "Semantic versioning the easy way. Powered by Co..."
 * console.log(pkg.programs)    // ["uplift"]
 * console.log(pkg.versions[0]) // "2.26.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/upliftci-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const upliftcidevPackage = {
  /**
   * The display name of this package.
   */
  name: 'uplift' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'upliftci.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Semantic versioning the easy way. Powered by Conventional Commits. Built for use with CI.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/upliftci.dev/package.yml' as const,
  homepageUrl: 'https://upliftci.dev' as const,
  githubUrl: 'https://github.com/gembaadvantage/uplift' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install upliftci.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +upliftci.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install upliftci.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'uplift',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.26.0',
    '2.25.0',
    '2.24.1',
    '2.24.0',
    '2.23.0',
    '2.22.0',
  ] as const,
  aliases: [] as const,
}

export type UpliftcidevPackage = typeof upliftcidevPackage
