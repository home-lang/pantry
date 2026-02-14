/**
 * **libccd** - Library for collision detection between two convex shapes
 *
 * @domain `github.com/danfis/libccd`
 * @version `2.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/danfis/libccd`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomdanfislibccd
 * console.log(pkg.name)        // "libccd"
 * console.log(pkg.description) // "Library for collision detection between two con..."
 * console.log(pkg.versions[0]) // "2.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/danfis/libccd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libccdPackage = {
  /**
  * The display name of this package.
  */
  name: 'libccd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/danfis/libccd' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Library for collision detection between two convex shapes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/danfis/libccd/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/danfis/libccd' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/danfis/libccd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/danfis/libccd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/danfis/libccd' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.0',
  ] as const,
  aliases: [] as const,
}

export type LibccdPackage = typeof libccdPackage
