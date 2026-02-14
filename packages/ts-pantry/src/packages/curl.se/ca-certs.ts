/**
 * **ca-certs** - pkgx package
 *
 * @domain `curl.se/ca-certs`
 * @version `2025.12.2` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install curl.se/ca-certs`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.curlsecacerts
 * console.log(pkg.name)        // "ca-certs"
 * console.log(pkg.versions[0]) // "2025.12.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/curl-se/ca-certs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const curlsecacertsPackage = {
  /**
  * The display name of this package.
  */
  name: 'ca-certs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'curl.se/ca-certs' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/curl.se/ca-certs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install curl.se/ca-certs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +curl.se/ca-certs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install curl.se/ca-certs' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
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
    '2025.12.2',
    '2025.11.4',
    '2025.9.9',
    '2025.8.12',
    '2025.7.15',
    '2025.5.20',
    '2025.2.25',
    '2024.12.31',
    '2024.11.26',
    '2024.9.24',
    '2024.7.2',
    '2024.3.11',
    '2023.12.12',
    '2023.8.22',
    '2023.5.30',
    '2023.1.10',
    '2022.10.11',
    '2022.7.19',
    '2022.4.26',
    '2022.3.29',
    '2022.3.18',
    '2022.2.1',
    '2021.10.26',
    '2021.9.30',
    '2021.7.5',
  ] as const,
  aliases: [] as const,
}

export type CurlsecacertsPackage = typeof curlsecacertsPackage
