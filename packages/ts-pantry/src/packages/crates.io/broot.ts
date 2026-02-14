/**
 * **broot** - A new way to see and navigate directory trees : https://dystroy.org/broot
 *
 * @domain `crates.io/broot`
 * @programs `broot`
 * @version `1.55.0` (70 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/broot`
 * @homepage https://dystroy.org/broot/
 * @dependencies `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiobroot
 * console.log(pkg.name)        // "broot"
 * console.log(pkg.description) // "A new way to see and navigate directory trees :..."
 * console.log(pkg.programs)    // ["broot"]
 * console.log(pkg.versions[0]) // "1.55.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/broot.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiobrootPackage = {
  /**
  * The display name of this package.
  */
  name: 'broot' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/broot' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A new way to see and navigate directory trees : https://dystroy.org/broot' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/broot/package.yml' as const,
  homepageUrl: 'https://dystroy.org/broot/' as const,
  githubUrl: 'https://github.com/Canop/broot' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/broot' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/broot -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/broot' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'broot',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.55.0',
    '1.54.0',
    '1.53.0',
    '1.52.0',
    '1.51.0',
    '1.50.0',
    '1.49.1',
    '1.49.0',
    '1.48.0',
    '1.47.0',
    '1.46.5',
    '1.46.4',
    '1.46.3',
    '1.46.2',
    '1.46.1',
    '1.46.0',
    '1.45.1',
    '1.45.0',
    '1.44.7',
    '1.44.6',
    '1.44.5',
    '1.44.4',
    '1.44.3',
    '1.44.2',
    '1.44.1',
    '1.44.0',
    '1.43.0',
    '1.42.0',
    '1.41.1',
    '1.41.0',
    '1.40.0',
    '1.39.2',
    '1.39.1',
    '1.39.0',
    '1.38.0',
    '1.37.0',
    '1.36.1',
    '1.36.0',
    '1.35.0',
    '1.34.0',
    '1.33.1',
    '1.33.0',
    '1.32.0',
    '1.31.0',
    '1.30.2',
    '1.30.1',
    '1.30.0',
    '1.29.0',
    '1.28.1',
    '1.28.0',
    '1.27.0',
    '1.26.1',
    '1.26.0',
    '1.25.2',
    '1.25.1',
    '1.25.0',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.0',
    '1.22.1',
    '1.22.0',
    '1.21.3',
    '1.21.2',
    '1.21.1',
    '1.21.0',
    '1.20.2',
    '1.20.1',
    '1.20.0',
    '1.16.2',
  ] as const,
  aliases: [] as const,
}

export type CratesiobrootPackage = typeof cratesiobrootPackage
