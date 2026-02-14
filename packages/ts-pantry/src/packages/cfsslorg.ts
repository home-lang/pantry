/**
 * **cfssl** - CFSSL: Cloudflare's PKI and TLS toolkit
 *
 * @domain `cfssl.org`
 * @programs `cfssl`, `cfssl-bundle`, `cfssl-certinfo`, `cfssl-newkey`, `cfssl-scan`, ... (+3 more)
 * @version `1.6.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cfssl.org`
 * @homepage https://cfssl.org/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cfsslorg
 * console.log(pkg.name)        // "cfssl"
 * console.log(pkg.description) // "CFSSL: Cloudflare's PKI and TLS toolkit"
 * console.log(pkg.programs)    // ["cfssl", "cfssl-bundle", ...]
 * console.log(pkg.versions[0]) // "1.6.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cfssl-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cfsslorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'cfssl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cfssl.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CFSSL: Cloudflare\'s PKI and TLS toolkit' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cfssl.org/package.yml' as const,
  homepageUrl: 'https://cfssl.org/' as const,
  githubUrl: 'https://github.com/cloudflare/cfssl' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install cfssl.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cfssl.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cfssl.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cfssl',
    'cfssl-bundle',
    'cfssl-certinfo',
    'cfssl-newkey',
    'cfssl-scan',
    'cfssljson',
    'mkbundle',
    'multirootca',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.5',
  ] as const,
  aliases: [] as const,
}

export type CfsslorgPackage = typeof cfsslorgPackage
