/**
 * **mpv** - Media player based on MPlayer and mplayer2
 *
 * @domain `mpv.io`
 * @programs `mpv`
 * @version `0.41.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install mpv.io`
 * @homepage https://mpv.io
 * @dependencies `ffmpeg.org`, `libjpeg-turbo.org@2`, `libarchive.org@3`, ... (+10 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `mesonbuild.com@1`, `linux:nixos.org/patchelf@0` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.mpvio
 * console.log(pkg.name)        // "mpv"
 * console.log(pkg.description) // "Media player based on MPlayer and mplayer2"
 * console.log(pkg.programs)    // ["mpv"]
 * console.log(pkg.versions[0]) // "0.41.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/mpv-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const mpvioPackage = {
  /**
  * The display name of this package.
  */
  name: 'mpv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mpv.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Media player based on MPlayer and mplayer2' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mpv.io/package.yml' as const,
  homepageUrl: 'https://mpv.io' as const,
  githubUrl: 'https://github.com/mpv-player/mpv' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install mpv.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mpv.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install mpv.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mpv',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'ffmpeg.org',
    'libjpeg-turbo.org@2',
    'libarchive.org@3',
    'github.com/libass/libass^0.17',
    'videolan.org/libplacebo@6',
    'littlecms.com@2',
    'luajit.org@2',
    'mujs.com@1',
    'freedesktop.org/uchardet@0',
    'vapoursynth.com@66',
    'yt-dlp.org',
    'linux:alsa-project.org/alsa-lib@1',
    'linux:github.com/adah1972/libunibreak@6',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'mesonbuild.com@1',
    'linux:nixos.org/patchelf@0',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.41.0',
    '0.40.0',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
    '0.35.1',
    '0.35.0',
    '0.34.1',
    '0.34.0',
    '0.33.1',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.1',
    '0.29.0',
    '0.28.2',
    '0.28.1',
    '0.28.0',
  ] as const,
  aliases: [] as const,
}

export type MpvioPackage = typeof mpvioPackage
