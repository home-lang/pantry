/**
 * **dog** - A command-line DNS client.
 *
 * @domain `dns.lookup.dog`
 * @programs `dog`
 * @version `0.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dns.lookup.dog`
 * @homepage https://dns.lookup.dog/
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dnslookupdog
 * console.log(pkg.name)        // "dog"
 * console.log(pkg.description) // "A command-line DNS client."
 * console.log(pkg.programs)    // ["dog"]
 * console.log(pkg.versions[0]) // "0.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dns-lookup-dog.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dnslookupdogPackage = {
  /**
  * The display name of this package.
  */
  name: 'dog' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dns.lookup.dog' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A command-line DNS client.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dns.lookup.dog/package.yml' as const,
  homepageUrl: 'https://dns.lookup.dog/' as const,
  githubUrl: 'https://github.com/ogham/dog' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install dns.lookup.dog' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dns.lookup.dog -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dns.lookup.dog' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dog',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type DnslookupdogPackage = typeof dnslookupdogPackage
