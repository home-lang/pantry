/**
 * **mc** - Unix like utilities for object store
 *
 * @domain `min.io/mc`
 * @programs `mc`
 * @version `2023.10.24.21.42.22` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install min.io/mc`
 * @homepage https://min.io/download
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.miniomc
 * console.log(pkg.name)        // "mc"
 * console.log(pkg.description) // "Unix like utilities for object store"
 * console.log(pkg.programs)    // ["mc"]
 * console.log(pkg.versions[0]) // "2023.10.24.21.42.22" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/min-io/mc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const miniomcPackage = {
  /**
  * The display name of this package.
  */
  name: 'mc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'min.io/mc' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Unix like utilities for object store' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/min.io/mc/package.yml' as const,
  homepageUrl: 'https://min.io/download' as const,
  githubUrl: 'https://github.com/minio/mc' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install min.io/mc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +min.io/mc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install min.io/mc' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mc',
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
    '2023.10.24.21.42.22',
  ] as const,
  aliases: [] as const,
}

export type MiniomcPackage = typeof miniomcPackage
