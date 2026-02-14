/**
 * **gitweb** - 🌲 Open the current remote repository in your browser
 *
 * @domain `crates.io/gitweb`
 * @programs `gitweb`
 * @version `0.3.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/gitweb`
 * @dependencies `openssl.org^1.1`, `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogitweb
 * console.log(pkg.name)        // "gitweb"
 * console.log(pkg.description) // "🌲 Open the current remote repository in your b..."
 * console.log(pkg.programs)    // ["gitweb"]
 * console.log(pkg.versions[0]) // "0.3.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/gitweb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogitwebPackage = {
  /**
  * The display name of this package.
  */
  name: 'gitweb' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/gitweb' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🌲 Open the current remote repository in your browser' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/gitweb/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/yoannfleurydev/gitweb' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/gitweb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/gitweb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/gitweb' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gitweb',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.5',
  ] as const,
  aliases: [] as const,
}

export type CratesiogitwebPackage = typeof cratesiogitwebPackage
