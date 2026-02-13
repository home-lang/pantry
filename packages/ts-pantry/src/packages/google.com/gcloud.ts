/**
 * **gcloud** - pkgx package
 *
 * @domain `google.com/gcloud`
 * @programs `gcloud`, `gsutil`, `bq`
 * @version `553.0.0` (104 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/gcloud`
 * @dependencies `python.org^3.11`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomgcloud
 * console.log(pkg.name)        // "gcloud"
 * console.log(pkg.programs)    // ["gcloud", "gsutil", ...]
 * console.log(pkg.versions[0]) // "553.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/gcloud.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomgcloudPackage = {
  /**
   * The display name of this package.
   */
  name: 'gcloud' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'google.com/gcloud' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/gcloud/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install google.com/gcloud' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/gcloud -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/gcloud' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gcloud',
    'gsutil',
    'bq',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org^3.11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '553.0.0',
    '552.0.0',
    '551.0.0',
    '550.0.0',
    '549.0.1',
    '549.0.0',
    '548.0.0',
    '547.0.0',
    '546.0.0',
    '545.0.0',
    '544.0.0',
    '543.0.0',
    '542.0.0',
    '541.0.0',
    '540.0.0',
    '539.0.0',
    '538.0.0',
    '537.0.0',
    '536.0.1',
    '536.0.0',
    '535.0.0',
    '534.0.0',
    '533.0.0',
    '532.0.0',
    '531.0.0',
    '530.0.0',
    '529.0.0',
    '528.0.0',
    '527.0.0',
    '526.0.1',
    '526.0.0',
    '525.0.0',
    '524.0.0',
    '523.0.1',
    '523.0.0',
    '522.0.0',
    '521.0.0',
    '520.0.0',
    '519.0.0',
    '518.0.0',
    '517.0.0',
    '516.0.0',
    '515.0.0',
    '514.0.0',
    '513.0.0',
    '512.0.0',
    '511.0.0',
    '510.0.0',
    '509.0.0',
    '508.0.0',
    '507.0.0',
    '506.0.0',
    '505.0.0',
    '504.0.1',
    '504.0.0',
    '503.0.0',
    '502.0.0',
    '501.0.0',
    '500.0.0',
    '499.0.0',
    '498.0.0',
    '497.0.0',
    '496.0.0',
    '495.0.0',
    '494.0.0',
    '493.0.0',
    '492.0.0',
    '491.0.0',
    '490.0.0',
    '489.0.0',
    '488.0.0',
    '487.0.0',
    '486.0.0',
    '485.0.0',
    '484.0.0',
    '483.0.0',
    '482.0.0',
    '481.0.0',
    '480.0.0',
    '479.0.0',
    '478.0.0',
    '477.0.0',
    '476.0.0',
    '475.0.0',
    '474.0.0',
    '473.0.0',
    '472.0.0',
    '471.0.0',
    '470.0.0',
    '469.0.0',
    '468.0.0',
    '467.0.0',
    '466.0.0',
    '465.0.0',
    '464.0.0',
    '463.0.0',
    '462.0.1',
    '462.0.0',
    '461.0.0',
    '460.0.0',
    '459.0.0',
    '458.0.1',
    '458.0.0',
    '457.0.0',
  ] as const,
  aliases: [] as const,
}

export type GooglecomgcloudPackage = typeof googlecomgcloudPackage
