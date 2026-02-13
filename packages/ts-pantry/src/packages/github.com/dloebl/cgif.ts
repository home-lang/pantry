/**
 * **cgif** - GIF encoder written in C
 *
 * @domain `github.com/dloebl/cgif`
 * @version `0.5.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/dloebl/cgif`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomdloeblcgif
 * console.log(pkg.name)        // "cgif"
 * console.log(pkg.description) // "GIF encoder written in C"
 * console.log(pkg.versions[0]) // "0.5.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/dloebl/cgif.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cgifPackage = {
  /**
   * The display name of this package.
   */
  name: 'cgif' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/dloebl/cgif' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GIF encoder written in C' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/dloebl/cgif/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/dloebl/cgif' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/dloebl/cgif' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/dloebl/cgif -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/dloebl/cgif' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.1',
    '0.5.0',
    '0.4.1',
    '0.4.0',
    '0.3.2',
    '0.3.1',
  ] as const,
  aliases: [] as const,
}

export type CgifPackage = typeof cgifPackage
