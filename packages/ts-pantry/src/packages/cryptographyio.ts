/**
 * **cryptography** - cryptography is a package designed to expose cryptographic primitives and recipes to Python developers.
 *
 * @domain `cryptography.io`
 * @version `46.0.3` (28 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cryptography.io`
 * @homepage https://cryptography.io
 * @dependencies `python.org>=3.11`, `github.com/python-cffi/cffi^1.16`, `openssl.org>=1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cryptographyio
 * console.log(pkg.name)        // "cryptography"
 * console.log(pkg.description) // "cryptography is a package designed to expose cr..."
 * console.log(pkg.versions[0]) // "46.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cryptography-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cryptographyioPackage = {
  /**
   * The display name of this package.
   */
  name: 'cryptography' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cryptography.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'cryptography is a package designed to expose cryptographic primitives and recipes to Python developers.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cryptography.io/package.yml' as const,
  homepageUrl: 'https://cryptography.io' as const,
  githubUrl: 'https://github.com/pyca/cryptography' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cryptography.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cryptography.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cryptography.io' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.11',
    'github.com/python-cffi/cffi^1.16',
    'openssl.org>=1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '46.0.3',
    '46.0.2',
    '46.0.1',
    '46.0.0',
    '45.0.7',
    '45.0.6',
    '45.0.5',
    '45.0.4',
    '45.0.3',
    '45.0.2',
    '45.0.1',
    '45.0.0',
    '44.0.3',
    '44.0.2',
    '44.0.1',
    '44.0.0',
    '43.0.3',
    '43.0.2',
    '43.0.1',
    '43.0.0',
    '42.0.8',
    '42.0.7',
    '42.0.6',
    '42.0.5',
    '42.0.4',
    '42.0.3',
    '42.0.2',
    '42.0.1',
  ] as const,
  aliases: [] as const,
}

export type CryptographyioPackage = typeof cryptographyioPackage
