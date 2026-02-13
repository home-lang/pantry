/**
 * **x264** - H.264/AVC encoder
 *
 * @domain `videolan.org/x264`
 * @programs `x264`
 * @version `0.164.3095` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install videolan.org/x264`
 * @homepage https://www.videolan.org/developers/x264.html
 * @buildDependencies `gnu.org/gcc`, `nasm.us` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.videolanorgx264
 * console.log(pkg.name)        // "x264"
 * console.log(pkg.description) // "H.264/AVC encoder"
 * console.log(pkg.programs)    // ["x264"]
 * console.log(pkg.versions[0]) // "0.164.3095" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/videolan-org/x264.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const videolanorgx264Package = {
  /**
   * The display name of this package.
   */
  name: 'x264' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'videolan.org/x264' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'H.264/AVC encoder' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/videolan.org/x264/package.yml' as const,
  homepageUrl: 'https://www.videolan.org/developers/x264.html' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install videolan.org/x264' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +videolan.org/x264 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install videolan.org/x264' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'x264',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/gcc',
    'nasm.us',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.164.3095',
  ] as const,
  aliases: [] as const,
}

export type Videolanorgx264Package = typeof videolanorgx264Package
