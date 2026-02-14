/**
 * **shaka-packager** - A media packaging and development framework for VOD and Live DASH and HLS applications, supporting Common Encryption for Widevine and other DRM Systems.
 *
 * @domain `github.com/shaka-project/shaka-packager`
 * @programs `packager`, `mpd_generator`
 * @version `3.4.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/shaka-project/shaka-packager`
 * @homepage https://shaka-project.github.io/shaka-packager/
 * @dependencies `linux:gnu.org/gcc/libstdcxx` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `python.org@^3.10`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomshakaprojectshakapackager
 * console.log(pkg.name)        // "shaka-packager"
 * console.log(pkg.description) // "A media packaging and development framework for..."
 * console.log(pkg.programs)    // ["packager", "mpd_generator"]
 * console.log(pkg.versions[0]) // "3.4.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/shaka-project/shaka-packager.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const shakapackagerPackage = {
  /**
  * The display name of this package.
  */
  name: 'shaka-packager' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/shaka-project/shaka-packager' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A media packaging and development framework for VOD and Live DASH and HLS applications, supporting Common Encryption for Widevine and other DRM Systems.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/shaka-project/shaka-packager/package.yml' as const,
  homepageUrl: 'https://shaka-project.github.io/shaka-packager/' as const,
  githubUrl: 'https://github.com/shaka-project/shaka-packager' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/shaka-project/shaka-packager' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/shaka-project/shaka-packager -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/shaka-project/shaka-packager' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'packager',
    'mpd_generator',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:gnu.org/gcc/libstdcxx',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org@^3',
    'python.org@^3.10',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.4.2',
    '3.4.1',
    '3.4.0',
  ] as const,
  aliases: [] as const,
}

export type ShakapackagerPackage = typeof shakapackagerPackage
