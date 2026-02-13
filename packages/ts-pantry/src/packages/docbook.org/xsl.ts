/**
 * **docbook-xsl** - XML vocabulary to create presentation-neutral documents
 *
 * @domain `docbook.org/xsl`
 * @programs `dbtoepub`
 * @version `1.79.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install docbook.org/xsl`
 * @dependencies `docbook.org^5`, `gnome.org/libxml2`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.docbookorgxsl
 * console.log(pkg.name)        // "docbook-xsl"
 * console.log(pkg.description) // "XML vocabulary to create presentation-neutral d..."
 * console.log(pkg.programs)    // ["dbtoepub"]
 * console.log(pkg.versions[0]) // "1.79.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/docbook-org/xsl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const docbookorgxslPackage = {
  /**
   * The display name of this package.
   */
  name: 'docbook-xsl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'docbook.org/xsl' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'XML vocabulary to create presentation-neutral documents' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/docbook.org/xsl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/docbook/xslt10-stylesheets' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install docbook.org/xsl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +docbook.org/xsl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install docbook.org/xsl' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dbtoepub',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'docbook.org^5',
    'gnome.org/libxml2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.79.2',
  ] as const,
  aliases: [] as const,
}

export type DocbookorgxslPackage = typeof docbookorgxslPackage
