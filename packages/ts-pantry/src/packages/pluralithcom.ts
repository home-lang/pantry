/**
 * **pluralith** - A tool for Terraform state visualisation and automated generation of infrastructure documentation
 *
 * @domain `pluralith.com`
 * @programs `pluralith`
 * @version `0.2.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pluralith.com`
 * @homepage https://www.pluralith.com
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pluralithcom
 * console.log(pkg.name)        // "pluralith"
 * console.log(pkg.description) // "A tool for Terraform state visualisation and au..."
 * console.log(pkg.programs)    // ["pluralith"]
 * console.log(pkg.versions[0]) // "0.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pluralith-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pluralithcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'pluralith' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pluralith.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool for Terraform state visualisation and automated generation of infrastructure documentation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pluralith.com/package.yml' as const,
  homepageUrl: 'https://www.pluralith.com' as const,
  githubUrl: 'https://github.com/Pluralith/pluralith-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pluralith.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pluralith.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pluralith.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pluralith',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.2.2',
  ] as const,
  aliases: [] as const,
}

export type PluralithcomPackage = typeof pluralithcomPackage
