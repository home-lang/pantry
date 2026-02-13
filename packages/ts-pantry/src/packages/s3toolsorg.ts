/**
 * **s3cmd** - Official s3cmd repo -- Command line tool for managing S3 compatible storage services (including Amazon S3 and CloudFront).
 *
 * @domain `s3tools.org`
 * @programs `s3cmd`
 * @version `2.4.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install s3tools.org`
 * @name `s3cmd`
 * @homepage https://s3tools.org/s3cmd
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access the package
 * const pkg = pantry.s3cmd
 * // Or access via domain
 * const samePkg = pantry.s3toolsorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "s3cmd"
 * console.log(pkg.description) // "Official s3cmd repo -- Command line tool for ma..."
 * console.log(pkg.programs)    // ["s3cmd"]
 * console.log(pkg.versions[0]) // "2.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/s3tools-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const s3cmdPackage = {
  /**
   * The display name of this package.
   */
  name: 's3cmd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 's3tools.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Official s3cmd repo -- Command line tool for managing S3 compatible storage services (including Amazon S3 and CloudFront).' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/s3tools.org/package.yml' as const,
  homepageUrl: 'https://s3tools.org/s3cmd' as const,
  githubUrl: 'https://github.com/s3tools/s3cmd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install s3tools.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +s3tools.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install s3tools.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    's3cmd',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.0',
    '2.3.0',
  ] as const,
  /**
   * Alternative names for this package.
   * You can use any of these names to access the package.
   */
  aliases: [] as const,
}

export type S3cmdPackage = typeof s3cmdPackage
