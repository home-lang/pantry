/**
 * **x265** - H.265/HEVC encoder
 *
 * @domain `videolan.org/x265`
 * @programs `x265`
 * @version `4.1.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install videolan.org/x265`
 * @homepage https://bitbucket.org/multicoreware/x265_git
 * @buildDependencies `cmake.org`, `linux:nasm.us` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.videolanorgx265
 * console.log(pkg.name)        // "x265"
 * console.log(pkg.description) // "H.265/HEVC encoder"
 * console.log(pkg.programs)    // ["x265"]
 * console.log(pkg.versions[0]) // "4.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/videolan-org/x265.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const videolanorgx265Package = {
  /**
  * The display name of this package.
  */
  name: 'x265' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'videolan.org/x265' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'H.265/HEVC encoder' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/videolan.org/x265/package.yml' as const,
  homepageUrl: 'https://bitbucket.org/multicoreware/x265_git' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install videolan.org/x265' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +videolan.org/x265 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install videolan.org/x265' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'x265',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org',
    'linux:nasm.us',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.1.0',
    '3.2.1',
  ] as const,
  aliases: [] as const,
}

export type Videolanorgx265Package = typeof videolanorgx265Package
