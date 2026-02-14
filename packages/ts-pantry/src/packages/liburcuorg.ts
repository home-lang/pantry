/**
 * **liburcu** - liburcu is a LGPLv2.1 userspace RCU (read-copy-update) library. This data synchronization library provides read-side access which scales linearly with the number of cores.
 *
 * @domain `liburcu.org`
 * @version `0.15.6` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install liburcu.org`
 * @homepage http://liburcu.org
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.liburcuorg
 * console.log(pkg.name)        // "liburcu"
 * console.log(pkg.description) // "liburcu is a LGPLv2.1 userspace RCU (read-copy-..."
 * console.log(pkg.versions[0]) // "0.15.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/liburcu-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const liburcuorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'liburcu' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'liburcu.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'liburcu is a LGPLv2.1 userspace RCU (read-copy-update) library. This data synchronization library provides read-side access which scales linearly with the number of cores.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/liburcu.org/package.yml' as const,
  homepageUrl: 'http://liburcu.org' as const,
  githubUrl: 'https://github.com/urcu/userspace-rcu' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install liburcu.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +liburcu.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install liburcu.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.15.6',
    '0.15.5',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.2',
  ] as const,
  aliases: [] as const,
}

export type LiburcuorgPackage = typeof liburcuorgPackage
