/**
 * **unzip** - Extraction utility for .zip compressed archives
 *
 * @domain `info-zip.org/unzip`
 * @programs `funzip`, `unzip`, `unzipsfx`, `zipgrep`, `zipinfo`
 * @version `6.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install info-zip.org/unzip`
 * @name `unzip`
 * @homepage https://infozip.sourceforge.net/UnZip.html
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access the package
 * const pkg = pantry.unzip
 * // Or access via domain
 * const samePkg = pantry.infoziporgunzip
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "unzip"
 * console.log(pkg.description) // "Extraction utility for .zip compressed archives"
 * console.log(pkg.programs)    // ["funzip", "unzip", ...]
 * console.log(pkg.versions[0]) // "6.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/info-zip-org/unzip.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const unzipPackage = {
  /**
  * The display name of this package.
  */
  name: 'unzip' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'info-zip.org/unzip' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Extraction utility for .zip compressed archives' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/info-zip.org/unzip/package.yml' as const,
  homepageUrl: 'https://infozip.sourceforge.net/UnZip.html' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install info-zip.org/unzip' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +info-zip.org/unzip -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install info-zip.org/unzip' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'funzip',
    'unzip',
    'unzipsfx',
    'zipgrep',
    'zipinfo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.0.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type UnzipPackage = typeof unzipPackage
