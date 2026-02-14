/**
 * **glfw** - A multi-platform library for OpenGL, OpenGL ES, Vulkan, window and input
 *
 * @domain `glfw.org`
 * @version `3.4.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install glfw.org`
 * @homepage https://www.glfw.org
 * @dependencies `linux:freeglut.sourceforge.io^3.4`, `linux:x.org/xcursor^1.2`, `linux:xkbcommon.org^1.0`, ... (+1 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.glfworg
 * console.log(pkg.name)        // "glfw"
 * console.log(pkg.description) // "A multi-platform library for OpenGL, OpenGL ES,..."
 * console.log(pkg.versions[0]) // "3.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/glfw-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const glfworgPackage = {
  /**
  * The display name of this package.
  */
  name: 'glfw' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'glfw.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A multi-platform library for OpenGL, OpenGL ES, Vulkan, window and input' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/glfw.org/package.yml' as const,
  homepageUrl: 'https://www.glfw.org' as const,
  githubUrl: 'https://github.com/glfw/glfw' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install glfw.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +glfw.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install glfw.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:freeglut.sourceforge.io^3.4',
    'linux:x.org/xcursor^1.2',
    'linux:xkbcommon.org^1.0',
    'linux:mesa3d.org^23.3',
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
    '3.4.0',
    '3.3.10',
    '3.3.9',
  ] as const,
  aliases: [] as const,
}

export type GlfworgPackage = typeof glfworgPackage
