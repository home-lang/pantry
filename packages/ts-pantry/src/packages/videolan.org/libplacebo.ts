/**
 * **libplacebo** - pkgx package
 *
 * @domain `videolan.org/libplacebo`
 * @version `7.360.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install videolan.org/libplacebo`
 * @dependencies `littlecms.com^2`, `github.com/KhronosGroup/Vulkan-Loader^1.3.272`
 * @buildDependencies `mesonbuild.com`, `python.org@^3.11`, `curl.se`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.videolanorglibplacebo
 * console.log(pkg.name)        // "libplacebo"
 * console.log(pkg.versions[0]) // "7.360.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/videolan-org/libplacebo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const videolanorglibplaceboPackage = {
  /**
  * The display name of this package.
  */
  name: 'libplacebo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'videolan.org/libplacebo' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/videolan.org/libplacebo/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install videolan.org/libplacebo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +videolan.org/libplacebo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install videolan.org/libplacebo' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'littlecms.com^2',
    'github.com/KhronosGroup/Vulkan-Loader^1.3.272',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@^3.11',
    'curl.se',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.360.0',
    '7.351.0',
    '7.349.0',
    '6.338.2',
    '6.338.1',
  ] as const,
  aliases: [] as const,
}

export type VideolanorglibplaceboPackage = typeof videolanorglibplaceboPackage
