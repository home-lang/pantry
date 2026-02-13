/**
 * **SeaweedFS** - SeaweedFS is a fast distributed storage system for blobs, objects, files, and data lake, for billions of files! Blob store has O(1) disk seek, cloud tiering. Filer supports Cloud Drive, cross-DC active-active replication, Kubernetes, POSIX FUSE mount, S3 API, S3 Gateway, Hadoop, WebDAV, encryption, Erasure Coding.
 *
 * @domain `seaweedfs.com`
 * @programs `weed`
 * @version `4.7.0` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install seaweedfs.com`
 * @homepage https://seaweedfs.com
 * @buildDependencies `go.dev@=1.22.0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.seaweedfscom
 * console.log(pkg.name)        // "SeaweedFS"
 * console.log(pkg.description) // "SeaweedFS is a fast distributed storage system ..."
 * console.log(pkg.programs)    // ["weed"]
 * console.log(pkg.versions[0]) // "4.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/seaweedfs-com.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install seaweedfs.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +seaweedfs.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install seaweedfs.com' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.7.0',
    '4.6.0',
    '4.5.0',
    '4.4.0',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.0',
    '3.99.0',
    '3.98.0',
    '3.97.0',
    '3.96.0',
    '3.95.0',
    '3.94.0',
    '3.93.0',
    '3.92.0',
    '3.91.0',
    '3.90.0',
    '3.89.0',
    '3.88.0',
    '3.87.0',
    '3.86.0',
    '3.85.0',
    '3.84.0',
    '3.83.0',
    '3.82.0',
    '3.81.0',
    '3.80.0',
    '3.79.0',
  ] as const,
  aliases: [] as const,
}

export type SeaweedfscomPackage = typeof seaweedfscomPackage
