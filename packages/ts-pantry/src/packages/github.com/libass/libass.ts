/**
 * **libass** - libass is a portable subtitle renderer for the ASS/SSA (Advanced Substation Alpha/Substation Alpha) subtitle format.
 *
 * @domain `github.com/libass/libass`
 * @version `0.17.4` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/libass/libass`
 * @dependencies `freetype.org@2`, `gnu.org/fribidi@1`, `harfbuzz.org`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/autoconf@2`, `gnu.org/automake@1`, `gnu.org/libtool@2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlibasslibass
 * console.log(pkg.name)        // "libass"
 * console.log(pkg.description) // "libass is a portable subtitle renderer for the ..."
 * console.log(pkg.versions[0]) // "0.17.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/libass/libass.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libassPackage = {
  /**
  * The display name of this package.
  */
  name: 'libass' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/libass/libass' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'libass is a portable subtitle renderer for the ASS/SSA (Advanced Substation Alpha/Substation Alpha) subtitle format.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libass/libass/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/libass/libass' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/libass/libass' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/libass/libass -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/libass/libass' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'freetype.org@2',
    'gnu.org/fribidi@1',
    'harfbuzz.org',
    'github.com/adah1972/libunibreak',
    'linux:freedesktop.org/fontconfig@2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf@2',
    'gnu.org/automake@1',
    'gnu.org/libtool@2',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.17.4',
    '0.17.3',
    '0.17.2',
    '0.17.1',
  ] as const,
  aliases: [] as const,
}

export type LibassPackage = typeof libassPackage
