/**
 * **xml** - Convert XML to another format (based on XSL or other tools)
 *
 * @domain `pagure.io/xmlto`
 * @programs `xmlif`, `xmlto`
 * @version `0.0.29` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pagure.io/xmlto`
 * @homepage https://pagure.io/xmlto/
 * @dependencies `docbook.org`, `github.com/util-linux/util-linux`, `darwin:gnome.org/libxslt` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pagureioxmlto
 * console.log(pkg.name)        // "xml"
 * console.log(pkg.description) // "Convert XML to another format (based on XSL or ..."
 * console.log(pkg.programs)    // ["xmlif", "xmlto"]
 * console.log(pkg.versions[0]) // "0.0.29" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pagure-io/xmlto.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pagureioxmltoPackage = {
  /**
   * The display name of this package.
   */
  name: 'xml' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pagure.io/xmlto' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Convert XML to another format (based on XSL or other tools)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pagure.io/xmlto/package.yml' as const,
  homepageUrl: 'https://pagure.io/xmlto/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pagure.io/xmlto' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pagure.io/xmlto -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pagure.io/xmlto' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xmlif',
    'xmlto',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'docbook.org',
    'github.com/util-linux/util-linux',
    'darwin:gnome.org/libxslt',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.0.29',
    '0.0.28',
  ] as const,
  aliases: [] as const,
}

export type PagureioxmltoPackage = typeof pagureioxmltoPackage
