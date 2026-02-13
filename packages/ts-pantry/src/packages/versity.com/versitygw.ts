/**
 * **versitygw** - versity s3 gateway
 *
 * @domain `versity.com/versitygw`
 * @programs `versitygw`
 * @version `1.1.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install versity.com/versitygw`
 * @homepage https://www.versity.com/products/versitygw/
 * @buildDependencies `go.dev@1.21.0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.versitycomversitygw
 * console.log(pkg.name)        // "versitygw"
 * console.log(pkg.description) // "versity s3 gateway"
 * console.log(pkg.programs)    // ["versitygw"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/versity-com/versitygw.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const versitycomversitygwPackage = {
  /**
   * The display name of this package.
   */
  name: 'versitygw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'versity.com/versitygw' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'versity s3 gateway' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/versity.com/versitygw/package.yml' as const,
  homepageUrl: 'https://www.versity.com/products/versitygw/' as const,
  githubUrl: 'https://github.com/versity/versitygw' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install versity.com/versitygw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +versity.com/versitygw -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install versity.com/versitygw' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'versitygw',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@1.21.0',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.0',
    '1.0.20',
    '1.0.19',
    '1.0.18',
    '1.0.17',
    '1.0.16',
    '1.0.15',
    '1.0.14',
    '1.0.13',
    '1.0.12',
    '1.0.11',
    '1.0.10',
    '1.0.9',
    '1.0.8',
    '1.0.7',
    '1.0.6',
    '1.0.5',
  ] as const,
  aliases: [] as const,
}

export type VersitycomversitygwPackage = typeof versitycomversitygwPackage
