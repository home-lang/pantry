/**
 * **etcd** - Distributed reliable key-value store for the most critical data of a distributed system
 *
 * @domain `etcd.io`
 * @programs `etcd`, `etcdctl`
 * @version `3.6.8` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install etcd.io`
 * @homepage https://etcd.io
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.etcdio
 * console.log(pkg.name)        // "etcd"
 * console.log(pkg.description) // "Distributed reliable key-value store for the mo..."
 * console.log(pkg.programs)    // ["etcd", "etcdctl"]
 * console.log(pkg.versions[0]) // "3.6.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/etcd-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const etcdioPackage = {
  /**
  * The display name of this package.
  */
  name: 'etcd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'etcd.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Distributed reliable key-value store for the most critical data of a distributed system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/etcd.io/package.yml' as const,
  homepageUrl: 'https://etcd.io' as const,
  githubUrl: 'https://github.com/etcd-io/etcd' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install etcd.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +etcd.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install etcd.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'etcd',
    'etcdctl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.22',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.6.8',
    '3.6.7',
    '3.6.6',
    '3.6.5',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.27',
    '3.5.26',
    '3.5.25',
    '3.5.24',
    '3.5.23',
    '3.5.22',
    '3.5.21',
    '3.5.20',
    '3.5.19',
    '3.5.18',
    '3.5.17',
    '3.5.16',
    '3.5.15',
    '3.5.14',
    '3.4.41',
    '3.4.40',
    '3.4.39',
    '3.4.38',
    '3.4.37',
    '3.4.36',
  ] as const,
  aliases: [] as const,
}

export type EtcdioPackage = typeof etcdioPackage
