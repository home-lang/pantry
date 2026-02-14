/**
 * **cephadm** - Ceph is a distributed object, block, and file storage platform
 *
 * @domain `ceph.com/cephadm`
 * @programs `cephadm`
 * @version `20.3.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ceph.com/cephadm`
 * @homepage https://ceph.io
 * @dependencies `openssl.org^1.1`, `python.org^3`
 * @buildDependencies `python.org@^3`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cephcomcephadm
 * console.log(pkg.name)        // "cephadm"
 * console.log(pkg.description) // "Ceph is a distributed object, block, and file s..."
 * console.log(pkg.programs)    // ["cephadm"]
 * console.log(pkg.versions[0]) // "20.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ceph-com/cephadm.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cephcomcephadmPackage = {
  /**
  * The display name of this package.
  */
  name: 'cephadm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ceph.com/cephadm' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Ceph is a distributed object, block, and file storage platform ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ceph.com/cephadm/package.yml' as const,
  homepageUrl: 'https://ceph.io' as const,
  githubUrl: 'https://github.com/ceph/ceph' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ceph.com/cephadm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ceph.com/cephadm -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ceph.com/cephadm' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cephadm',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
    'python.org^3',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@^3',
    'gnu.org/coreutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '20.3.0',
    '20.2.0',
    '20.1.1',
    '20.1.0',
    '20.0.0',
    '19.3.0',
    '19.2.3',
    '19.2.2',
    '19.2.1',
    '18.2.8',
    '18.2.7',
    '18.2.6',
    '18.2.5',
  ] as const,
  aliases: [] as const,
}

export type CephcomcephadmPackage = typeof cephcomcephadmPackage
