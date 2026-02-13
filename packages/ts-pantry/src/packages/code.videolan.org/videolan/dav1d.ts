/**
 * **dav1d** - AV1 decoder targeted to be small and fast
 *
 * @domain `code.videolan.org/videolan/dav1d`
 * @programs `dav1d`
 * @version `1.5.3` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install code.videolan.org/videolan/dav1d`
 * @homepage https://code.videolan.org/videolan/dav1d
 * @buildDependencies `mesonbuild.com@>=0.49` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.codevideolanorgvideolandav1d
 * console.log(pkg.name)        // "dav1d"
 * console.log(pkg.description) // "AV1 decoder targeted to be small and fast"
 * console.log(pkg.programs)    // ["dav1d"]
 * console.log(pkg.versions[0]) // "1.5.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/code-videolan-org/videolan/dav1d.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const codevideolanorgvideolandav1dPackage = {
  /**
   * The display name of this package.
   */
  name: 'dav1d' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'code.videolan.org/videolan/dav1d' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'AV1 decoder targeted to be small and fast' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/code.videolan.org/videolan/dav1d/package.yml' as const,
  homepageUrl: 'https://code.videolan.org/videolan/dav1d' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install code.videolan.org/videolan/dav1d' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +code.videolan.org/videolan/dav1d -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install code.videolan.org/videolan/dav1d' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dav1d',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@>=0.49',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.3',
    '1.2.0',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type Codevideolanorgvideolandav1dPackage = typeof codevideolanorgvideolandav1dPackage
