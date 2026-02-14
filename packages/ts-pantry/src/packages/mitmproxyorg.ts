/**
 * **mitmproxy** - An interactive TLS-capable intercepting HTTP proxy for penetration testers and software developers.
 *
 * @domain `mitmproxy.org`
 * @programs `mitmproxy`
 * @version `12.2.1` (30 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mitmproxy.org`
 * @homepage https://mitmproxy.org
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mitmproxyorg
 * console.log(pkg.name)        // "mitmproxy"
 * console.log(pkg.description) // "An interactive TLS-capable intercepting HTTP pr..."
 * console.log(pkg.programs)    // ["mitmproxy"]
 * console.log(pkg.versions[0]) // "12.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mitmproxy-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mitmproxyorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'mitmproxy' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mitmproxy.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'An interactive TLS-capable intercepting HTTP proxy for penetration testers and software developers.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mitmproxy.org/package.yml' as const,
  homepageUrl: 'https://mitmproxy.org' as const,
  githubUrl: 'https://github.com/mitmproxy/mitmproxy' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mitmproxy.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mitmproxy.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mitmproxy.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mitmproxy',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@~3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '12.2.1',
    '12.2.0',
    '12.1.2',
    '12.1.1',
    '12.1.0',
    '12.0.1',
    '12.0.0',
    '11.1.3',
    '11.1.2',
    '11.1.1',
    '11.1.0',
    '11.0.2',
    '11.0.1',
    '11.0.0',
    '10.4.2',
    '10.4.1',
    '10.4.0',
    '10.3.0',
    '10.2.4',
    '10.2.3',
    '10.2.2',
    '10.2.1',
    '10.2.0',
    '10.1.6',
    '10.1.5',
    '10.1.4',
    '10.1.3',
    '10.1.2',
    '10.1.1',
    '10.1.0',
  ] as const,
  aliases: [] as const,
}

export type MitmproxyorgPackage = typeof mitmproxyorgPackage
