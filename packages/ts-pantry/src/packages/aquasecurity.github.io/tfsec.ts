/**
 * **tfsec** - Static analysis security scanner for your terraform code
 *
 * @domain `aquasecurity.github.io/tfsec`
 * @programs `tfsec`
 * @version `1.28.14` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install aquasecurity.github.io/tfsec`
 * @homepage https://aquasecurity.github.io/tfsec/latest/
 * @buildDependencies `go.dev@>=1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.aquasecuritygithubiotfsec
 * console.log(pkg.name)        // "tfsec"
 * console.log(pkg.description) // "Static analysis security scanner for your terra..."
 * console.log(pkg.programs)    // ["tfsec"]
 * console.log(pkg.versions[0]) // "1.28.14" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/aquasecurity-github-io/tfsec.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const aquasecuritygithubiotfsecPackage = {
  /**
   * The display name of this package.
   */
  name: 'tfsec' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'aquasecurity.github.io/tfsec' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Static analysis security scanner for your terraform code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aquasecurity.github.io/tfsec/package.yml' as const,
  homepageUrl: 'https://aquasecurity.github.io/tfsec/latest/' as const,
  githubUrl: 'https://github.com/aquasecurity/tfsec' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install aquasecurity.github.io/tfsec' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aquasecurity.github.io/tfsec -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install aquasecurity.github.io/tfsec' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tfsec',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@>=1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.28.14',
    '1.28.13',
    '1.28.12',
    '1.28.11',
    '1.28.10',
    '1.28.9',
    '1.28.7',
    '1.28.6',
    '1.28.5',
  ] as const,
  aliases: [] as const,
}

export type AquasecuritygithubiotfsecPackage = typeof aquasecuritygithubiotfsecPackage
