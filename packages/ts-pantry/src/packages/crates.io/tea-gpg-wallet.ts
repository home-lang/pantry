/**
 * **tea-gpg-wallet** - pkgx package
 *
 * @domain `crates.io/tea-gpg-wallet`
 * @programs `tea-gpg-wallet`
 * @version `0.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/tea-gpg-wallet`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cratesioteagpgwallet
 * console.log(pkg.name)        // "tea-gpg-wallet"
 * console.log(pkg.programs)    // ["tea-gpg-wallet"]
 * console.log(pkg.versions[0]) // "0.2.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/crates-io/tea-gpg-wallet.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/tea-gpg-wallet' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/tea-gpg-wallet -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/tea-gpg-wallet' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tea-gpg-wallet',
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioteagpgwalletPackage = typeof cratesioteagpgwalletPackage
