/**
 * **tesseract** - Tesseract Open Source OCR Engine (main repository)
 *
 * @domain `tesseract-ocr.github.io`
 * @programs `tesseract`
 * @version `5.5.2` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tesseract-ocr.github.io`
 * @homepage https://github.com/tesseract-ocr/
 * @dependencies `cairographics.org@1`, `unicode.org@71`, `leptonica.org`, ... (+2 more)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tesseractocrgithubio
 * console.log(pkg.name)        // "tesseract"
 * console.log(pkg.description) // "Tesseract Open Source OCR Engine (main repository)"
 * console.log(pkg.programs)    // ["tesseract"]
 * console.log(pkg.versions[0]) // "5.5.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tesseract-ocr-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tesseractocrgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'tesseract' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tesseract-ocr.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Tesseract Open Source OCR Engine (main repository)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tesseract-ocr.github.io/package.yml' as const,
  homepageUrl: 'https://github.com/tesseract-ocr/' as const,
  githubUrl: 'https://github.com/tesseract-ocr/tesseract' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tesseract-ocr.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tesseract-ocr.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tesseract-ocr.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tesseract',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'cairographics.org@1',
    'unicode.org@71',
    'leptonica.org',
    'libarchive.org',
    'gnome.org/pango@1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.5.2',
    '5.5.1',
    '5.5.0',
    '5.4.1',
    '5.4.0',
    '5.3.4',
    '5.3.3',
    '5.3.2',
    '5.3.1',
    '5.3.0',
  ] as const,
  aliases: [] as const,
}

export type TesseractocrgithubioPackage = typeof tesseractocrgithubioPackage
