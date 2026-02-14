/**
 * **ldns** - LDNS is a DNS library that facilitates DNS tool programming
 *
 * @domain `nlnetlabs.nl/ldns`
 * @programs `drill`, `ldns-config`
 * @version `1.9.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nlnetlabs.nl/ldns`
 * @homepage https://nlnetlabs.nl/projects/ldns/
 * @dependencies `openssl.org^1`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `swig.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nlnetlabsnlldns
 * console.log(pkg.name)        // "ldns"
 * console.log(pkg.description) // "LDNS is a DNS library that facilitates DNS tool..."
 * console.log(pkg.programs)    // ["drill", "ldns-config"]
 * console.log(pkg.versions[0]) // "1.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nlnetlabs-nl/ldns.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nlnetlabsnlldnsPackage = {
  /**
  * The display name of this package.
  */
  name: 'ldns' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'nlnetlabs.nl/ldns' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'LDNS is a DNS library that facilitates DNS tool programming' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nlnetlabs.nl/ldns/package.yml' as const,
  homepageUrl: 'https://nlnetlabs.nl/projects/ldns/' as const,
  githubUrl: 'https://github.com/NLnetLabs/ldns' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install nlnetlabs.nl/ldns' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nlnetlabs.nl/ldns -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nlnetlabs.nl/ldns' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'drill',
    'ldns-config',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'swig.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.9.0',
    '1.8.4',
    '1.8.3',
  ] as const,
  aliases: [] as const,
}

export type NlnetlabsnlldnsPackage = typeof nlnetlabsnlldnsPackage
