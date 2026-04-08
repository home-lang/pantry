/**
 * **SeaweedFS** - SeaweedFS is a fast distributed storage system for blobs, objects, files, and data lake, for billions of files! Blob store has O(1) disk seek, cloud tiering. Filer supports Cloud Drive, cross-DC active-active replication, Kubernetes, POSIX FUSE mount, S3 API, S3 Gateway, Hadoop, WebDAV, encryption, Erasure Coding.
 *
 * @domain `seaweedfs.com`
 * @programs `weed`
 * @version `4.17.0` (39 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install seaweedfs.com`
 * @homepage https://seaweedfs.com
 * @buildDependencies `go.dev@=1.22.0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.seaweedfscom
 * console.log(pkg.name)        // "SeaweedFS"
 * console.log(pkg.description) // "SeaweedFS is a fast distributed storage system ..."
 * console.log(pkg.programs)    // ["weed"]
 * console.log(pkg.versions[0]) // "4.17.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/seaweedfs-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const seaweedfscomPackage = {
  /**
  * The display name of this package.
  */
  name: 'SeaweedFS' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'seaweedfs.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'SeaweedFS is a fast distributed storage system for blobs, objects, files, and data lake, for billions of files! Blob store has O(1) disk seek, cloud tiering. Filer supports Cloud Drive, cross-DC active-active replication, Kubernetes, POSIX FUSE mount, S3 API, S3 Gateway, Hadoop, WebDAV, encryption, Erasure Coding.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/seaweedfs.com/package.yml' as const,
  homepageUrl: 'https://seaweedfs.com' as const,
  githubUrl: 'https://github.com/seaweedfs/seaweedfs' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install seaweedfs.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +seaweedfs.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install seaweedfs.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'weed',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@=1.22.0',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.19',
    '4.18',
    '4.17',
    '4.17.0',
    '4.16',
    '4.16.0',
    '4.15',
    '4.15.0',
    '4.14.0',
    '4.13',
    '4.13.0',
    '4.12',
    '4.12.0',
    '4.11.0',
    '4.10.0',
    '4.09',
    '4.9.0',
    '4.8.0',
    '4.07',
    '4.7.0',
    '4.06',
    '4.6.0',
    '4.05',
    '4.04',
    '4.03',
    '4.02',
    '4.01',
    '4.00',
    '3.99',
    '3.98',
    '3.97',
    '3.96',
    '3.95',
    '3.94',
    '3.93',
    '3.92',
    '3.91',
    '3.90',
    '3.89',
    '3.88',
    '3.87',
    '3.86',
    '3.85',
    '3.84',
    '3.83',
    '3.82',
    '3.81',
    '3.80',
    '3.79',
    '3.77',
    '3.76',
    '3.75',
    '3.74',
    '3.73',
    '3.72',
    '3.71',
    '3.69',
    '3.68',
    '3.67',
    '3.66',
    '3.65',
    '3.64',
    '3.63',
    '3.62',
  ] as const,
  aliases: [] as const,
}

export type SeaweedfscomPackage = typeof seaweedfscomPackage
