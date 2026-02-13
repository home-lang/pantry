/**
 * **docbook** - pkgx package
 *
 * @domain `docbook.org`
 * @version `5.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install docbook.org`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.docbookorg
 * console.log(pkg.name)        // "docbook"
 * console.log(pkg.versions[0]) // "5.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/docbook-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const docbookorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'docbook' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'docbook.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/docbook.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install docbook.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +docbook.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install docbook.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.0',
  ] as const,
  aliases: [] as const,
}

export type DocbookorgPackage = typeof docbookorgPackage
