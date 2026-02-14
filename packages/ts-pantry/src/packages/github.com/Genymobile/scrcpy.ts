/**
 * **scrcpy** - Display and control your Android device
 *
 * @domain `github.com/Genymobile/scrcpy`
 * @programs `scrcpy`
 * @version `3.3.4` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Genymobile/scrcpy`
 * @dependencies `ffmpeg.org`, `libusb.info`, `libsdl.org`, ... (+3 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `mesonbuild.com`, `gnu.org/wget`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgenymobilescrcpy
 * console.log(pkg.name)        // "scrcpy"
 * console.log(pkg.description) // "Display and control your Android device"
 * console.log(pkg.programs)    // ["scrcpy"]
 * console.log(pkg.versions[0]) // "3.3.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Genymobile/scrcpy.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const scrcpyPackage = {
  /**
  * The display name of this package.
  */
  name: 'scrcpy' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/Genymobile/scrcpy' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Display and control your Android device' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Genymobile/scrcpy/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Genymobile/scrcpy' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/Genymobile/scrcpy' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Genymobile/scrcpy -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Genymobile/scrcpy' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'scrcpy',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'ffmpeg.org',
    'libusb.info',
    'libsdl.org',
    'linux:webmproject.org/libvpx<1.15.1 # since 3.3, .9 lib api',
    'darwin:sourceware.org/bzip2',
    'darwin:zlib.net',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
    'gnu.org/wget',
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.3.4',
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.7.0',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.1',
    '2.3.0',
    '2.2.0',
    '2.1.0',
  ] as const,
  aliases: [] as const,
}

export type ScrcpyPackage = typeof scrcpyPackage
