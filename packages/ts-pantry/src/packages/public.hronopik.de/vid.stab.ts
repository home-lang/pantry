/**
 * **vid.stab** - Video stabilization library
 *
 * @domain `public.hronopik.de/vid.stab`
 * @version `1.1.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install public.hronopik.de/vid.stab`
 * @homepage http://public.hronopik.de/vid.stab/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.publichronopikdevidstab
 * console.log(pkg.name)        // "vid.stab"
 * console.log(pkg.description) // "Video stabilization library"
 * console.log(pkg.versions[0]) // "1.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/public-hronopik-de/vid-stab.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const publichronopikdevidstabPackage = {
  /**
  * The display name of this package.
  */
  name: 'vid.stab' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'public.hronopik.de/vid.stab' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Video stabilization library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/public.hronopik.de/vid.stab/package.yml' as const,
  homepageUrl: 'http://public.hronopik.de/vid.stab/' as const,
  githubUrl: 'https://github.com/georgmartius/vid.stab' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install public.hronopik.de/vid.stab' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +public.hronopik.de/vid.stab -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install public.hronopik.de/vid.stab' as const,
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
    '1.1.1',
  ] as const,
  aliases: [] as const,
}

export type PublichronopikdevidstabPackage = typeof publichronopikdevidstabPackage
