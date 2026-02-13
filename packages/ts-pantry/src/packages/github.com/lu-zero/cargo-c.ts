/**
 * **cargo-c** - Helper program to build and install c-like libraries
 *
 * @domain `github.com/lu-zero/cargo-c`
 * @programs `cargo-capi`, `cargo-cbuild`, `cargo-cinstall`, `cargo-ctest`
 * @version `0.10.19` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/lu-zero/cargo-c`
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`, `libssh2.org`, `openssl.org^1.1`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomluzerocargoc
 * console.log(pkg.name)        // "cargo-c"
 * console.log(pkg.description) // "Helper program to build and install c-like libr..."
 * console.log(pkg.programs)    // ["cargo-capi", "cargo-cbuild", ...]
 * console.log(pkg.versions[0]) // "0.10.19" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/lu-zero/cargo-c.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cargocPackage = {
  /**
   * The display name of this package.
   */
  name: 'cargo-c' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/lu-zero/cargo-c' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Helper program to build and install c-like libraries' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lu-zero/cargo-c/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/lu-zero/cargo-c' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/lu-zero/cargo-c' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/lu-zero/cargo-c -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/lu-zero/cargo-c' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cargo-capi',
    'cargo-cbuild',
    'cargo-cinstall',
    'cargo-ctest',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libgit2.org~1.7 # links to libgit2.so.1.7',
    'libssh2.org',
    'openssl.org^1.1',
    'zlib.net',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.19',
    '0.10.18',
    '0.10.17',
    '0.10.16',
    '0.10.15',
    '0.10.14',
    '0.10.13',
    '0.10.12',
    '0.10.11',
    '0.10.10',
    '0.10.9',
    '0.10.8',
    '0.10.7',
    '0.10.6',
    '0.10.5',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.32',
    '0.9.31',
    '0.9.30',
    '0.9.29',
    '0.9.28',
    '0.9.27',
    '0.9.26',
    '0.9.24',
    '0.9.22',
    '0.9.21',
    '0.9.20',
  ] as const,
  aliases: [] as const,
}

export type CargocPackage = typeof cargocPackage
