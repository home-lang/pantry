/**
 * **tea-gpg-wallet** - pkgx package
 *
 * @domain `crates.io/tea-gpg-wallet`
 * @version `0.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/tea-gpg-wallet`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioteagpgwallet
 * console.log(pkg.name)        // "tea-gpg-wallet"
 * console.log(pkg.versions[0]) // "0.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/tea-gpg-wallet.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioteagpgwalletPackage = {
  /**
   * The display name of this package.
   */
  name: 'tea-gpg-wallet' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/tea-gpg-wallet' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tea-gpg-wallet/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/tea-gpg-wallet' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/tea-gpg-wallet -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/tea-gpg-wallet' as const,
  programs: [] as const,
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
    '0.2.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioteagpgwalletPackage = typeof cratesioteagpgwalletPackage
