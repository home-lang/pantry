/**
 * **minio** - MinIO is a high-performance, S3 compatible object store, open sourced under GNU AGPLv3 license.
 *
 * @domain `min.io`
 * @programs `minio`
 * @version `2023.10.25.6.33.25` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install min.io`
 * @homepage https://min.io
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.minio
 * console.log(pkg.name)        // "minio"
 * console.log(pkg.description) // "MinIO is a high-performance, S3 compatible obje..."
 * console.log(pkg.programs)    // ["minio"]
 * console.log(pkg.versions[0]) // "2023.10.25.6.33.25" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/min-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const minioPackage = {
  /**
  * The display name of this package.
  */
  name: 'minio' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'min.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'MinIO is a high-performance, S3 compatible object store, open sourced under GNU AGPLv3 license.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/min.io/package.yml' as const,
  homepageUrl: 'https://min.io' as const,
  githubUrl: 'https://github.com/minio/minio' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install min.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +min.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install min.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'minio',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2023.10.25.6.33.25',
  ] as const,
  aliases: [] as const,
}

export type MinioPackage = typeof minioPackage
