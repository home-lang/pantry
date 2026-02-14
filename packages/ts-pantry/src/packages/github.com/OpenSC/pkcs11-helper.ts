/**
 * **pkcs11-helper** - Library that simplifies the interaction with PKCS#11 providers for end-user applications using a simple API and optional OpenSSL engine
 *
 * @domain `github.com/OpenSC/pkcs11-helper`
 * @version `1.31.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/OpenSC/pkcs11-helper`
 * @dependencies `openssl.org^3.1.0`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomopenscpkcs11helper
 * console.log(pkg.name)        // "pkcs11-helper"
 * console.log(pkg.description) // "Library that simplifies the interaction with PK..."
 * console.log(pkg.versions[0]) // "1.31.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/OpenSC/pkcs11-helper.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pkcs11helperPackage = {
  /**
  * The display name of this package.
  */
  name: 'pkcs11-helper' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/OpenSC/pkcs11-helper' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Library that simplifies the interaction with PKCS#11 providers for end-user applications using a simple API and optional OpenSSL engine' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/OpenSC/pkcs11-helper/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/OpenSC/pkcs11-helper' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/OpenSC/pkcs11-helper' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/OpenSC/pkcs11-helper -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/OpenSC/pkcs11-helper' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^3.1.0',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.31.0',
    '1.30.0',
    '1.29.0',
  ] as const,
  aliases: [] as const,
}

export type Pkcs11helperPackage = typeof pkcs11helperPackage
