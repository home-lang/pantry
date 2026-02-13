/**
 * **drill** - Drill is an HTTP load testing application written in Rust
 *
 * @domain `crates.io/drill`
 * @programs `drill`
 * @version `0.9.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/drill`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiodrill
 * console.log(pkg.name)        // "drill"
 * console.log(pkg.description) // "Drill is an HTTP load testing application writt..."
 * console.log(pkg.programs)    // ["drill"]
 * console.log(pkg.versions[0]) // "0.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/drill.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiodrillPackage = {
  /**
   * The display name of this package.
   */
  name: 'drill' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/drill' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Drill is an HTTP load testing application written in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/drill/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fcsonline/drill' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/drill' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/drill -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/drill' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'drill',
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
    '0.9.0',
    '0.8.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiodrillPackage = typeof cratesiodrillPackage
