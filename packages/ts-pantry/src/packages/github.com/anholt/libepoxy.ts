/**
 * **libepoxy** - Epoxy is a library for handling OpenGL function pointer management for you
 *
 * @domain `github.com/anholt/libepoxy`
 * @version `1.5.10` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/anholt/libepoxy`
 * @dependencies `linux:x.org/x11`, `linux:mesa3d.org` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `mesonbuild.com`, `python.org@>=3.1<3.12`, `linux:freeglut.sourceforge.io` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomanholtlibepoxy
 * console.log(pkg.name)        // "libepoxy"
 * console.log(pkg.description) // "Epoxy is a library for handling OpenGL function..."
 * console.log(pkg.versions[0]) // "1.5.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/anholt/libepoxy.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libepoxyPackage = {
  /**
   * The display name of this package.
   */
  name: 'libepoxy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/anholt/libepoxy' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Epoxy is a library for handling OpenGL function pointer management for you' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/anholt/libepoxy/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/anholt/libepoxy' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/anholt/libepoxy' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/anholt/libepoxy -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/anholt/libepoxy' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:x.org/x11',
    'linux:mesa3d.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@>=3.1<3.12',
    'linux:freeglut.sourceforge.io',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.10',
  ] as const,
  aliases: [] as const,
}

export type LibepoxyPackage = typeof libepoxyPackage
