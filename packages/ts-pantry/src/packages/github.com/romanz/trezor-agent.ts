/**
 * **trezor-agent** - Hardware-based SSH/GPG/age agent
 *
 * @domain `github.com/romanz/trezor-agent`
 * @programs `jade-agent`, `jade-gpg`, `jade-gpg-agent`, `keepkey-agent`, `keepkeyctl`, ... (+12 more)
 * @version `0.15.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/romanz/trezor-agent`
 * @dependencies `python.org~3.12`, `libusb.info^1`, `darwin:libpng.org~1.6` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomromanztrezoragent
 * console.log(pkg.name)        // "trezor-agent"
 * console.log(pkg.description) // "Hardware-based SSH/GPG/age agent"
 * console.log(pkg.programs)    // ["jade-agent", "jade-gpg", ...]
 * console.log(pkg.versions[0]) // "0.15.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/romanz/trezor-agent.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const trezoragentPackage = {
  /**
   * The display name of this package.
   */
  name: 'trezor-agent' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/romanz/trezor-agent' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Hardware-based SSH/GPG/age agent' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/romanz/trezor-agent/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/romanz/trezor-agent' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/romanz/trezor-agent' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/romanz/trezor-agent -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/romanz/trezor-agent' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jade-agent',
    'jade-gpg',
    'jade-gpg-agent',
    'keepkey-agent',
    'keepkeyctl',
    'ledger-agent',
    'ledger-gpg',
    'ledger-gpg-agent',
    'onlykey-agent',
    'onlykey-cli',
    'onlykey-gpg',
    'onlykey-gpg-agent',
    'trezor-agent',
    'trezor-gpg',
    'trezor-gpg-agent',
    'trezor-signify',
    'trezorctl',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'python.org~3.12',
    'libusb.info^1',
    'darwin:libpng.org~1.6',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.15.0',
    '0.14.8',
  ] as const,
  aliases: [] as const,
}

export type TrezoragentPackage = typeof trezoragentPackage
