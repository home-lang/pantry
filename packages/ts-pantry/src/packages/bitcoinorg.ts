/**
 * **bitcoin** - Decentralized, peer to peer payment network
 *
 * @domain `bitcoin.org`
 * @programs `bitcoin-cli`, `bitcoin-tx`, `bitcoin-util`, `bitcoin-wallet`, `bitcoind`
 * @version `30.2.0` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install bitcoin.org`
 * @homepage https://bitcoincore.org/
 * @dependencies `oracle.com/berkeley-db^18`, `boost.org^1`, `libevent.org^2`, ... (+4 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/autoconf@^2`, `gnu.org/automake@^1`, `gnu.org/libtool@^2`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.bitcoinorg
 * console.log(pkg.name)        // "bitcoin"
 * console.log(pkg.description) // "Decentralized, peer to peer payment network"
 * console.log(pkg.programs)    // ["bitcoin-cli", "bitcoin-tx", ...]
 * console.log(pkg.versions[0]) // "30.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/bitcoin-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bitcoinorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'bitcoin' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'bitcoin.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Decentralized, peer to peer payment network' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bitcoin.org/package.yml' as const,
  homepageUrl: 'https://bitcoincore.org/' as const,
  githubUrl: 'https://github.com/bitcoin/bitcoin' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install bitcoin.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bitcoin.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install bitcoin.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bitcoin-cli',
    'bitcoin-tx',
    'bitcoin-util',
    'bitcoin-wallet',
    'bitcoind',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'oracle.com/berkeley-db^18',
    'boost.org^1',
    'libevent.org^2',
    'zeromq.org^4',
    'sqlite.org^3',
    'capnproto.org^1 # since 30.0',
    'linux:gnu.org/gcc/libstdcxx',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/autoconf@^2',
    'gnu.org/automake@^1',
    'gnu.org/libtool@^2',
    'cmake.org@^3.22',
    'linux:gnu.org/gcc',
    'linux:nixos.org/patchelf',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '30.2.0',
    '30.1.0',
    '30.0.0',
    '29.2.0',
    '29.1.0',
    '29.0.0',
    '28.3.0',
    '28.2.0',
    '28.1.0',
    '28.0.0',
    '27.2.0',
    '27.1.0',
    '27.0.0',
    '26.2.0',
    '26.1.0',
    '26.0.0',
    '25.2.0',
    '25.1.0',
    '25.0.0',
    '24.2.0',
    '24.1.0',
    '24.0.1',
    '23.2.0',
  ] as const,
  aliases: [] as const,
}

export type BitcoinorgPackage = typeof bitcoinorgPackage
