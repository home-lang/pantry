/**
 * **ocrmypdf** - OCRmyPDF adds an OCR text layer to scanned PDF files, allowing them to be searched
 *
 * @domain `github.com/ocrmypdf/OCRmyPDF`
 * @programs `ocrmypdf`
 * @version `16.13.0` (42 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ocrmypdf/OCRmyPDF`
 * @homepage https://ocrmypdf.readthedocs.io/en/latest/
 * @dependencies `pkgx.sh^1`, `qpdf.sourceforge.io^12 # as of 16.10.1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomocrmypdfocrmypdf
 * console.log(pkg.name)        // "ocrmypdf"
 * console.log(pkg.description) // "OCRmyPDF adds an OCR text layer to scanned PDF ..."
 * console.log(pkg.programs)    // ["ocrmypdf"]
 * console.log(pkg.versions[0]) // "16.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ocrmypdf/OCRmyPDF.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ocrmypdfPackage = {
  /**
   * The display name of this package.
   */
  name: 'ocrmypdf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/ocrmypdf/OCRmyPDF' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'OCRmyPDF adds an OCR text layer to scanned PDF files, allowing them to be searched' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ocrmypdf/OCRmyPDF/package.yml' as const,
  homepageUrl: 'https://ocrmypdf.readthedocs.io/en/latest/' as const,
  githubUrl: 'https://github.com/ocrmypdf/OCRmyPDF' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/ocrmypdf/OCRmyPDF' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ocrmypdf/OCRmyPDF -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ocrmypdf/OCRmyPDF' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ocrmypdf',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
    'qpdf.sourceforge.io^12 # as of 16.10.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '16.13.0',
    '16.12.0',
    '16.11.1',
    '16.11.0',
    '16.10.4',
    '16.10.3',
    '16.10.2',
    '16.10.1',
    '16.10.0',
    '16.7.0',
    '16.6.2',
    '16.6.1',
    '16.6.0',
    '16.5.0',
    '16.4.3',
    '16.4.2',
    '16.4.1',
    '16.4.0',
    '16.3.1',
    '16.3.0',
    '16.2.0',
    '16.1.2',
    '16.1.1',
    '16.1.0',
    '16.0.4',
    '16.0.3',
    '16.0.2',
    '16.0.1',
    '16.0.0',
    '15.4.4',
    '15.4.3',
    '15.4.2',
    '15.4.1',
    '15.4.0',
    '15.3.1',
    '15.3.0',
    '15.2.0',
    '15.1.0',
    '15.0.2',
    '15.0.1',
    '15.0.0',
    '14.4.0',
  ] as const,
  aliases: [] as const,
}

export type OcrmypdfPackage = typeof ocrmypdfPackage
