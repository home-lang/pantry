/**
 * **certbot** - Certbot is EFF's tool to obtain certs from Let's Encrypt and (optionally) auto-enable HTTPS on your server.  It can also act as a client for any other CA that uses the ACME protocol.
 *
 * @domain `certbot.eff.org`
 * @programs `certbot`
 * @version `5.3.1` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install certbot.eff.org`
 * @homepage https://certbot.eff.org/
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.certbotefforg
 * console.log(pkg.name)        // "certbot"
 * console.log(pkg.description) // "Certbot is EFF's tool to obtain certs from Let'..."
 * console.log(pkg.programs)    // ["certbot"]
 * console.log(pkg.versions[0]) // "5.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/certbot-eff-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const certbotefforgPackage = {
  /**
  * The display name of this package.
  */
  name: 'certbot' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'certbot.eff.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Certbot is EFF\'s tool to obtain certs from Let\'s Encrypt and (optionally) auto-enable HTTPS on your server.  It can also act as a client for any other CA that uses the ACME protocol.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/certbot.eff.org/package.yml' as const,
  homepageUrl: 'https://certbot.eff.org/' as const,
  githubUrl: 'https://github.com/certbot/certbot' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install certbot.eff.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +certbot.eff.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install certbot.eff.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'certbot',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.3.1',
    '5.3.0',
    '5.2.2',
    '5.2.1',
    '5.1.0',
    '5.0.0',
    '4.2.0',
    '4.1.1',
    '4.1.0',
    '4.0.0',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.1',
    '3.0.0',
    '2.11.1',
    '2.11.0',
    '2.10.0',
    '2.9.0',
    '2.8.0',
    '2.7.4',
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.0',
  ] as const,
  aliases: [] as const,
}

export type CertbotefforgPackage = typeof certbotefforgPackage
