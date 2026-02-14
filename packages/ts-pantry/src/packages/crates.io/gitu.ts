/**
 * **gitu** - A TUI Git client inspired by Magit
 *
 * @domain `crates.io/gitu`
 * @programs `gitu`
 * @version `0.40.0` (49 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/gitu`
 * @dependencies `zlib.net~1.3`, `libgit2.org~1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogitu
 * console.log(pkg.name)        // "gitu"
 * console.log(pkg.description) // "A TUI Git client inspired by Magit"
 * console.log(pkg.programs)    // ["gitu"]
 * console.log(pkg.versions[0]) // "0.40.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/gitu.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogituPackage = {
  /**
  * The display name of this package.
  */
  name: 'gitu' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/gitu' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A TUI Git client inspired by Magit' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/gitu/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/altsem/gitu' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/gitu' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/gitu -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/gitu' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gitu',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net~1.3',
    'libgit2.org~1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.40.0',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.3',
    '0.30.1',
    '0.29.0',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.0',
    '0.26.0',
    '0.25.0',
    '0.24.0',
    '0.23.1',
    '0.23.0',
    '0.22.1',
    '0.22.0',
    '0.21.1',
    '0.21.0',
    '0.20.1',
    '0.20.0',
    '0.19.2',
    '0.19.1',
    '0.19.0',
    '0.18.4',
    '0.18.3',
    '0.18.2',
    '0.18.0',
    '0.17.1',
    '0.17.0',
    '0.16.0',
    '0.15.0',
    '0.14.0',
    '0.13.1',
    '0.13.0',
    '0.12.1',
    '0.12.0',
    '0.11.0',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiogituPackage = typeof cratesiogituPackage
