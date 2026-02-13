/**
 * **pcre** - Perl compatible regular expressions library
 *
 * @domain `pcre.org`
 * @programs `pcre-config`, `pcregrep`, `pcretest`
 * @version `8.45.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pcre.org`
 * @homepage https://www.pcre.org/
 * @dependencies `sourceware.org/bzip2@1`, `zlib.net@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pcreorg
 * console.log(pkg.name)        // "pcre"
 * console.log(pkg.description) // "Perl compatible regular expressions library"
 * console.log(pkg.programs)    // ["pcre-config", "pcregrep", ...]
 * console.log(pkg.versions[0]) // "8.45.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pcre-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pcreorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'pcre' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pcre.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Perl compatible regular expressions library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pcre.org/package.yml' as const,
  homepageUrl: 'https://www.pcre.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pcre.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pcre.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pcre.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pcre-config',
    'pcregrep',
    'pcretest',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'sourceware.org/bzip2@1',
    'zlib.net@1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.45.0',
  ] as const,
  aliases: [] as const,
}

export type PcreorgPackage = typeof pcreorgPackage
