/**
 * **asn1** - ASN.1 structure parser library
 *
 * @domain `gnu.org/libtasn1`
 * @programs `asn1Coding`, `asn1Decoding`, `asn1Parser`
 * @version `4.21.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/libtasn1`
 * @homepage https://www.gnu.org/software/libtasn1/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorglibtasn1
 * console.log(pkg.name)        // "asn1"
 * console.log(pkg.description) // "ASN.1 structure parser library"
 * console.log(pkg.programs)    // ["asn1Coding", "asn1Decoding", ...]
 * console.log(pkg.versions[0]) // "4.21.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/libtasn1.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorglibtasn1Package = {
  /**
   * The display name of this package.
   */
  name: 'asn1' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/libtasn1' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'ASN.1 structure parser library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libtasn1/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/libtasn1/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/libtasn1' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/libtasn1 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/libtasn1' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'asn1Coding',
    'asn1Decoding',
    'asn1Parser',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.21.0',
    '4.20.0',
    '4.19.0',
  ] as const,
  aliases: [] as const,
}

export type Gnuorglibtasn1Package = typeof gnuorglibtasn1Package
