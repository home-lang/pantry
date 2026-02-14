/**
 * **gc** - The Boehm-Demers-Weiser conservative C/C++ Garbage Collector (bdwgc, also known as bdw-gc, boehm-gc, libgc)
 *
 * @domain `hboehm.info/gc`
 * @version `8.2.12` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hboehm.info/gc`
 * @homepage https://www.hboehm.info/gc/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hboehminfogc
 * console.log(pkg.name)        // "gc"
 * console.log(pkg.description) // "The Boehm-Demers-Weiser conservative C/C++ Garb..."
 * console.log(pkg.versions[0]) // "8.2.12" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hboehm-info/gc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hboehminfogcPackage = {
  /**
  * The display name of this package.
  */
  name: 'gc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'hboehm.info/gc' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Boehm-Demers-Weiser conservative C/C++ Garbage Collector (bdwgc, also known as bdw-gc, boehm-gc, libgc)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hboehm.info/gc/package.yml' as const,
  homepageUrl: 'https://www.hboehm.info/gc/' as const,
  githubUrl: 'https://github.com/ivmai/bdwgc' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install hboehm.info/gc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hboehm.info/gc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hboehm.info/gc' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '8.2.12',
    '8.2.10',
    '8.2.8',
    '8.2.6',
    '8.2.4',
    '8.0.18',
    '8.0.16',
    '8.0.14',
    '8.0.12',
    '7.6.26',
    '7.6.24',
    '7.6.22',
    '7.6.20',
  ] as const,
  aliases: [] as const,
}

export type HboehminfogcPackage = typeof hboehminfogcPackage
