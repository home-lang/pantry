/**
 * **freeglut.sourceforge** - Free implementation of the OpenGL Utility Toolkit (GLUT)
 *
 * @domain `freeglut.sourceforge.io`
 * @version `3.8.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freeglut.sourceforge.io`
 * @homepage http://freeglut.sourceforge.net
 * @dependencies `x.org/x11`, `x.org/xi`, `x.org/xrandr`, ... (+4 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freeglutsourceforgeio
 * console.log(pkg.name)        // "freeglut.sourceforge"
 * console.log(pkg.description) // "Free implementation of the OpenGL Utility Toolk..."
 * console.log(pkg.versions[0]) // "3.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freeglut-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freeglutsourceforgeioPackage = {
  /**
   * The display name of this package.
   */
  name: 'freeglut.sourceforge' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freeglut.sourceforge.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Free implementation of the OpenGL Utility Toolkit (GLUT)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freeglut.sourceforge.io/package.yml' as const,
  homepageUrl: 'http://freeglut.sourceforge.net' as const,
  githubUrl: 'https://github.com/FreeGLUTProject/freeglut' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freeglut.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freeglut.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freeglut.sourceforge.io' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'x.org/x11',
    'x.org/xi',
    'x.org/xrandr',
    'x.org/xxf86vm',
    'mesa3d.org',
    'linux:freedesktop.org/mesa-glu',
    'linux:x.org/xinput',
  ] as const,
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
    '3.8.0',
    '3.6.0',
    '3.4.0',
  ] as const,
  aliases: [] as const,
}

export type FreeglutsourceforgeioPackage = typeof freeglutsourceforgeioPackage
