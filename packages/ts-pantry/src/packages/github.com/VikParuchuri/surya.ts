/**
 * **Surya** - OCR, layout analysis, reading order, table recognition in 90+ languages
 *
 * @domain `github.com/VikParuchuri/surya`
 * @programs `surya_detect`
 * @version `0.17.0` (79 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/VikParuchuri/surya`
 * @homepage https://www.datalab.to
 * @dependencies `pkgx.sh^1`, `linux:mesa3d.org^23.3`, `linux:gnome.org/glib^2`, ... (+1 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomvikparuchurisurya
 * console.log(pkg.name)        // "Surya"
 * console.log(pkg.description) // "OCR, layout analysis, reading order, table reco..."
 * console.log(pkg.programs)    // ["surya_detect"]
 * console.log(pkg.versions[0]) // "0.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/VikParuchuri/surya.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const suryaPackage = {
  /**
   * The display name of this package.
   */
  name: 'Surya' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/VikParuchuri/surya' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'OCR, layout analysis, reading order, table recognition in 90+ languages' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/VikParuchuri/surya/package.yml' as const,
  homepageUrl: 'https://www.datalab.to' as const,
  githubUrl: 'https://github.com/VikParuchuri/surya' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/VikParuchuri/surya' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/VikParuchuri/surya -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/VikParuchuri/surya' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'surya_detect',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'pkgx.sh^1',
    'linux:mesa3d.org^23.3',
    'linux:gnome.org/glib^2',
    'linux:mupdf.com',
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
    '0.17.0',
    '0.16.7',
    '0.16.6',
    '0.16.5',
    '0.16.4',
    '0.16.3',
    '0.16.2',
    '0.16.1',
    '0.16.0',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.7',
    '0.14.6',
    '0.14.5',
    '0.14.4',
    '0.14.3',
    '0.14.2',
    '0.14.1',
    '0.14.0',
    '0.13.1',
    '0.13.0',
    '0.12.1',
    '0.12.0',
    '0.11.1',
    '0.11.0',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.0',
    '0.6.13',
    '0.6.12',
    '0.6.11',
    '0.6.10',
    '0.6.9',
    '0.6.8',
    '0.6.7',
    '0.6.6',
    '0.6.5',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.0',
    '0.4.15',
    '0.4.14',
    '0.4.12',
    '0.4.11',
    '0.4.10',
    '0.4.9',
    '0.4.8',
    '0.4.7',
    '0.4.6',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.0',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.6',
    '0.1.5',
  ] as const,
  aliases: [] as const,
}

export type SuryaPackage = typeof suryaPackage
