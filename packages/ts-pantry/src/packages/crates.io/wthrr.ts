/**
 * **wthrr** - 🌞 🦀 🌙 Weather companion for the terminal. Rust app.
 *
 * @domain `crates.io/wthrr`
 * @programs `wthrr`
 * @version `1.2.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/wthrr`
 * @homepage https://crates.io/crates/wthrr
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiowthrr
 * console.log(pkg.name)        // "wthrr"
 * console.log(pkg.description) // "🌞 🦀 🌙 Weather companion for the terminal. Ru..."
 * console.log(pkg.programs)    // ["wthrr"]
 * console.log(pkg.versions[0]) // "1.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/wthrr.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiowthrrPackage = {
  /**
   * The display name of this package.
   */
  name: 'wthrr' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/wthrr' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🌞 🦀 🌙 Weather companion for the terminal. Rust app. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/wthrr/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/wthrr' as const,
  githubUrl: 'https://github.com/ttytm/wthrr-the-weathercrab' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/wthrr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/wthrr -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/wthrr' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'wthrr',
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.1',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiowthrrPackage = typeof cratesiowthrrPackage
