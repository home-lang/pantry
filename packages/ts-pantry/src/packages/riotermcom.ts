/**
 * **rio** - A hardware-accelerated GPU terminal emulator focusing to run in desktops and browsers.
 *
 * @domain `rioterm.com`
 * @programs `rio`
 * @version `0.2.37` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install rioterm.com`
 * @homepage https://rioterm.com
 * @dependencies `linux:freedesktop.org/fontconfig` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.riotermcom
 * console.log(pkg.name)        // "rio"
 * console.log(pkg.description) // "A hardware-accelerated GPU terminal emulator fo..."
 * console.log(pkg.programs)    // ["rio"]
 * console.log(pkg.versions[0]) // "0.2.37" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/rioterm-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const riotermcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'rio' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rioterm.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A hardware-accelerated GPU terminal emulator focusing to run in desktops and browsers.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rioterm.com/package.yml' as const,
  homepageUrl: 'https://rioterm.com' as const,
  githubUrl: 'https://github.com/raphamorim/rio' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install rioterm.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rioterm.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install rioterm.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rio',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:freedesktop.org/fontconfig',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.37',
    '0.2.36',
    '0.2.35',
    '0.2.34',
    '0.2.33',
    '0.2.32',
    '0.2.31',
    '0.2.30',
    '0.2.29',
    '0.2.28',
    '0.2.27',
    '0.2.26',
    '0.2.25',
    '0.2.24',
    '0.2.23',
    '0.2.22',
    '0.2.21',
    '0.2.20',
    '0.2.19',
    '0.2.18',
    '0.2.17',
    '0.2.16',
    '0.2.15',
    '0.2.14',
    '0.2.13',
    '0.2.12',
    '0.2.11',
    '0.2.10',
    '0.2.9',
    '0.2.8',
    '0.2.7',
    '0.2.6',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.17',
    '0.1.16',
    '0.1.15',
    '0.1.14',
    '0.1.13',
    '0.1.12',
    '0.1.11',
    '0.1.10',
    '0.1.9',
    '0.1.8',
    '0.1.7',
  ] as const,
  aliases: [] as const,
}

export type RiotermcomPackage = typeof riotermcomPackage
