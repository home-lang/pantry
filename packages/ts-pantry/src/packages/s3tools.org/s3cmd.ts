/**
 * **s3cmd** - Official s3cmd repo -- Command line tool for managing S3 compatible storage services (including Amazon S3 and CloudFront).
 *
 * @domain `s3tools.org/s3cmd`
 * @programs `s3cmd`
 * @version `2.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install s3tools.org/s3cmd`
 * @homepage https://s3tools.org/s3cmd
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.s3toolsorgs3cmd
 * console.log(pkg.name)        // "s3cmd"
 * console.log(pkg.description) // "Official s3cmd repo -- Command line tool for ma..."
 * console.log(pkg.programs)    // ["s3cmd"]
 * console.log(pkg.versions[0]) // "2.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/s3tools-org/s3cmd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const s3toolsorgs3cmdPackage = {
  /**
  * The display name of this package.
  */
  name: 's3cmd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 's3tools.org/s3cmd' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Official s3cmd repo -- Command line tool for managing S3 compatible storage services (including Amazon S3 and CloudFront).' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/s3tools.org/s3cmd/package.yml' as const,
  homepageUrl: 'https://s3tools.org/s3cmd' as const,
  githubUrl: 'https://github.com/s3tools/s3cmd' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install s3tools.org/s3cmd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +s3tools.org/s3cmd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install s3tools.org/s3cmd' as const,
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
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.4.0',
  ] as const,
  aliases: [] as const,
}

export type S3toolsorgs3cmdPackage = typeof s3toolsorgs3cmdPackage
