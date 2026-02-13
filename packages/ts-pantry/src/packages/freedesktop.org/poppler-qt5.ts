/**
 * **poppler-qt5** - PDF rendering library (based on the xpdf-3.0 code base)
 *
 * @domain `freedesktop.org/poppler-qt5`
 * @programs `pdfattach`, `pdfdetach`, `pdffonts`, `pdfimages`, `pdfinfo`, ... (+8 more)
 * @version `26.1.0` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/poppler-qt5`
 * @homepage https://poppler.freedesktop.org/
 * @dependencies `gnupg.org/libassuan^2`, `cairographics.org^1`, `freedesktop.org/fontconfig^2`, ... (+17 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org`, `linux:gnu.org/binutils@^2`, `linux:llvm.org@~21.1` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgpopplerqt5
 * console.log(pkg.name)        // "poppler-qt5"
 * console.log(pkg.description) // "PDF rendering library (based on the xpdf-3.0 co..."
 * console.log(pkg.programs)    // ["pdfattach", "pdfdetach", ...]
 * console.log(pkg.versions[0]) // "26.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/poppler-qt5.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgpopplerqt5Package = {
  /**
   * The display name of this package.
   */
  name: 'poppler-qt5' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/poppler-qt5' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'PDF rendering library (based on the xpdf-3.0 code base)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/poppler-qt5/package.yml' as const,
  homepageUrl: 'https://poppler.freedesktop.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/poppler-qt5' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/poppler-qt5 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/poppler-qt5' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pdfattach',
    'pdfdetach',
    'pdffonts',
    'pdfimages',
    'pdfinfo',
    'pdfseparate',
    'pdfsig',
    'pdftocairo',
    'pdftohtml',
    'pdftoppm',
    'pdftops',
    'pdftotext',
    'pdfunite',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'gnupg.org/libassuan^2',
    'cairographics.org^1',
    'freedesktop.org/fontconfig^2',
    'freetype.org^2',
    'gnu.org/gettext^0',
    'gnome.org/libxml2~2.13 # since 25.4.0, 2.14 changed the API version',
    'gnome.org/libxslt~1.1.44 # 1.1.45 bumps the libxml2 version requirement',
    'gnome.org/glib^2',
    'gnupg.org/gpgme^1',
    'gnupg.org/libgpg-error^1',
    'libjpeg-turbo.org^2',
    'libpng.org^1',
    'simplesystems.org/libtiff^4',
    'littlecms.com^2',
    'mozilla.org/nss^3',
    'openjpeg.org^2',
    'qt.io~5',
    'curl.se^8',
    'darwin:gnupg.org/libassuan^2',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'linux:gnu.org/binutils@^2',
    'linux:llvm.org@~21.1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '26.1.0',
    '25.12.0',
    '25.11.0',
    '25.10.0',
    '25.9.1',
    '25.9.0',
    '25.8.0',
    '25.7.0',
    '25.6.0',
    '25.5.0',
    '25.4.0',
    '25.3.0',
    '25.2.0',
    '25.1.0',
    '24.12.0',
    '24.11.0',
    '24.10.0',
    '24.9.0',
    '24.8.0',
    '24.7.0',
    '24.6.1',
    '24.6.0',
    '24.5.0',
    '24.4.0',
    '24.3.0',
    '24.2.0',
    '24.1.0',
    '23.12.0',
    '23.11.0',
  ] as const,
  aliases: [] as const,
}

export type Freedesktoporgpopplerqt5Package = typeof freedesktoporgpopplerqt5Package
