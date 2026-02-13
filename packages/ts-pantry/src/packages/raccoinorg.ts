/**
 * **raccoin** - Crypto Portfolio and Tax Reporting Tool
 *
 * @domain `raccoin.org`
 * @programs `raccoin`
 * @version `0.2.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install raccoin.org`
 * @homepage https://raccoin.org/
 * @dependencies `gnu.org/libiconv^1`, `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.raccoinorg
 * console.log(pkg.name)        // "raccoin"
 * console.log(pkg.description) // "Crypto Portfolio and Tax Reporting Tool"
 * console.log(pkg.programs)    // ["raccoin"]
 * console.log(pkg.versions[0]) // "0.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/raccoin-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const raccoinorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'raccoin' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'raccoin.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Crypto Portfolio and Tax Reporting Tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/raccoin.org/package.yml' as const,
  homepageUrl: 'https://raccoin.org/' as const,
  githubUrl: 'https://github.com/bjorn/raccoin' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install raccoin.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +raccoin.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install raccoin.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'raccoin',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/libiconv^1',
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type RaccoinorgPackage = typeof raccoinorgPackage
