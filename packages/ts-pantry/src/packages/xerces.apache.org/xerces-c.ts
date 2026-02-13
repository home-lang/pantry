/**
 * **xerces-c** - Validating XML parser
 *
 * @domain `xerces.apache.org/xerces-c`
 * @programs `CreateDOMDocument`, `DOMCount`, `DOMPrint`, `EnumVal`, `PParse`, ... (+10 more)
 * @version `3.3.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xerces.apache.org/xerces-c`
 * @homepage https://xerces.apache.org/xerces-c/
 * @dependencies `curl.se`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xercesapacheorgxercesc
 * console.log(pkg.name)        // "xerces-c"
 * console.log(pkg.description) // "Validating XML parser"
 * console.log(pkg.programs)    // ["CreateDOMDocument", "DOMCount", ...]
 * console.log(pkg.versions[0]) // "3.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xerces-apache-org/xerces-c.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xercesapacheorgxercescPackage = {
  /**
   * The display name of this package.
   */
  name: 'xerces-c' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'xerces.apache.org/xerces-c' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Validating XML parser' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xerces.apache.org/xerces-c/package.yml' as const,
  homepageUrl: 'https://xerces.apache.org/xerces-c/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install xerces.apache.org/xerces-c' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xerces.apache.org/xerces-c -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xerces.apache.org/xerces-c' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'CreateDOMDocument',
    'DOMCount',
    'DOMPrint',
    'EnumVal',
    'PParse',
    'PSVIWriter',
    'Redirect',
    'SAX2Count',
    'SAX2Print',
    'SAXCount',
    'SAXPrint',
    'SCMPrint',
    'SEnumVal',
    'StdInParse',
    'XInclude',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se',
  ] as const,
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
    '3.3.0',
    '3.2.5',
    '3.2.4',
  ] as const,
  aliases: [] as const,
}

export type XercesapacheorgxercescPackage = typeof xercesapacheorgxercescPackage
