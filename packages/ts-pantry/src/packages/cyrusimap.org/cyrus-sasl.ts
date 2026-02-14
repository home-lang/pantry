/**
 * **cyrus-sasl** - pkgx package
 *
 * @domain `cyrusimap.org/cyrus-sasl`
 * @version `2.1.28` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cyrusimap.org/cyrus-sasl`
 * @buildDependencies `kerberos.org`, `openssl.org@^1.1.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cyrusimaporgcyrussasl
 * console.log(pkg.name)        // "cyrus-sasl"
 * console.log(pkg.versions[0]) // "2.1.28" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cyrusimap-org/cyrus-sasl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cyrusimaporgcyrussaslPackage = {
  /**
  * The display name of this package.
  */
  name: 'cyrus-sasl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cyrusimap.org/cyrus-sasl' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cyrusimap.org/cyrus-sasl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cyrusimap/cyrus-sasl' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install cyrusimap.org/cyrus-sasl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cyrusimap.org/cyrus-sasl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cyrusimap.org/cyrus-sasl' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'kerberos.org',
    'openssl.org@^1.1.1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.28',
  ] as const,
  aliases: [] as const,
}

export type CyrusimaporgcyrussaslPackage = typeof cyrusimaporgcyrussaslPackage
