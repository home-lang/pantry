/**
 * **mupdf** - Lightweight PDF and XPS viewer
 *
 * @domain `mupdf.com`
 * @programs `mupdf-gl`, `muraster`, `mutool`
 * @version `1.27.2` (41 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mupdf.com`
 * @homepage https://mupdf.com/
 * @dependencies `zlib.net^1`, `openssl.org^1.1`, `info-zip.org/unzip^6`, ... (+17 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mupdfcom
 * console.log(pkg.name)        // "mupdf"
 * console.log(pkg.description) // "Lightweight PDF and XPS viewer"
 * console.log(pkg.programs)    // ["mupdf-gl", "muraster", ...]
 * console.log(pkg.versions[0]) // "1.27.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mupdf-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mupdfcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'mupdf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mupdf.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Lightweight PDF and XPS viewer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mupdf.com/package.yml' as const,
  homepageUrl: 'https://mupdf.com/' as const,
  githubUrl: 'https://github.com/ArtifexSoftware/mupdf' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mupdf.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mupdf.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mupdf.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mupdf-gl',
    'muraster',
    'mutool',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'zlib.net^1',
    'openssl.org^1.1',
    'info-zip.org/unzip^6',
    'github.com/google/brotli^1',
    'freetype.org^2',
    'harfbuzz.org^9',
    'mujs.com^1',
    'openjpeg.org^2',
    'jbig2dec.com^0',
    'darwin:libarchive.org^3',
    'linux:mesa3d.org^23',
    'linux:freeglut.sourceforge.io^3',
    'linux:freedesktop.org/mesa-glu^9',
    'linux:x.org/protocol>=2022',
    'linux:x.org/x11^1',
    'linux:x.org/xcursor^1',
    'linux:x.org/xinerama^1',
    'linux:x.org/xrandr^1',
    'linux:gnome.org/glib^2',
    'linux:x.org/xtrans^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.27.2',
    '1.27.1',
    '1.27.0',
    '1.26.12',
    '1.26.11',
    '1.26.10',
    '1.26.9',
    '1.26.8',
    '1.26.7',
    '1.26.6',
    '1.26.5',
    '1.26.4',
    '1.26.3',
    '1.26.2',
    '1.26.1',
    '1.26.0',
    '1.25.6',
    '1.25.5',
    '1.25.4',
    '1.25.3',
    '1.25.2',
    '1.25.1',
    '1.25.0',
    '1.24.11',
    '1.24.10',
    '1.24.9',
    '1.24.8',
    '1.24.7',
    '1.24.6',
    '1.24.5',
    '1.24.4',
    '1.24.3',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.11',
    '1.23.10',
    '1.23.9',
    '1.23.8',
    '1.23.7',
    '1.23.6',
  ] as const,
  aliases: [] as const,
}

export type MupdfcomPackage = typeof mupdfcomPackage
