/**
 * **tidy** - The granddaddy of HTML tools, with support for modern standards
 *
 * @domain `html-tidy.org`
 * @programs `tidy`
 * @version `5.8.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install html-tidy.org`
 * @homepage https://www.html-tidy.org/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.htmltidyorg
 * console.log(pkg.name)        // "tidy"
 * console.log(pkg.description) // "The granddaddy of HTML tools, with support for ..."
 * console.log(pkg.programs)    // ["tidy"]
 * console.log(pkg.versions[0]) // "5.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/html-tidy-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const htmltidyorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'tidy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'html-tidy.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The granddaddy of HTML tools, with support for modern standards' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/html-tidy.org/package.yml' as const,
  homepageUrl: 'https://www.html-tidy.org/' as const,
  githubUrl: 'https://github.com/htacg/tidy-html5' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install html-tidy.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +html-tidy.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install html-tidy.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tidy',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.8.0',
  ] as const,
  aliases: [] as const,
}

export type HtmltidyorgPackage = typeof htmltidyorgPackage
