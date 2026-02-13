/**
 * **vmaf** - Perceptual video quality assessment based on multi-method fusion.
 *
 * @domain `netflix.com/vmaf`
 * @programs `vmaf`
 * @version `3.0.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install netflix.com/vmaf`
 * @buildDependencies `mesonbuild.com`, `nasm.us` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.netflixcomvmaf
 * console.log(pkg.name)        // "vmaf"
 * console.log(pkg.description) // "Perceptual video quality assessment based on mu..."
 * console.log(pkg.programs)    // ["vmaf"]
 * console.log(pkg.versions[0]) // "3.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/netflix-com/vmaf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const netflixcomvmafPackage = {
  /**
   * The display name of this package.
   */
  name: 'vmaf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'netflix.com/vmaf' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Perceptual video quality assessment based on multi-method fusion.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/netflix.com/vmaf/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Netflix/vmaf' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install netflix.com/vmaf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +netflix.com/vmaf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install netflix.com/vmaf' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'vmaf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
    'nasm.us',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.0.0',
    '2.3.1',
  ] as const,
  aliases: [] as const,
}

export type NetflixcomvmafPackage = typeof netflixcomvmafPackage
