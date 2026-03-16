/**
 * **requests** - A simple, yet elegant, HTTP library.
 *
 * @domain `github.com/psf/requests`
 * @version `2.32.5` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/psf/requests`
 * @homepage https://requests.readthedocs.io/en/latest/
 * @dependencies `python.org~3.11`, `github.com/Ousret/charset_normalizer^3`, `github.com/kjd/idna^3`, ... (+2 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcompsfrequests
 * console.log(pkg.name)        // "requests"
 * console.log(pkg.description) // "A simple, yet elegant, HTTP library."
 * console.log(pkg.versions[0]) // "2.32.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/psf/requests.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const requestsPackage = {
  /**
  * The display name of this package.
  */
  name: 'requests' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/psf/requests' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A simple, yet elegant, HTTP library.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/psf/requests/package.yml' as const,
  homepageUrl: 'https://requests.readthedocs.io/en/latest/' as const,
  githubUrl: 'https://github.com/psf/requests' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/psf/requests' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/psf/requests -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/psf/requests' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
    'github.com/Ousret/charset_normalizer^3',
    'github.com/kjd/idna^3',
    'github.com/urllib3/urllib3^2',
    'certifi.io/python-certifi^2024',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.32.5',
    '2.32.4',
    '2.32.3',
    '2.32.2',
    '2.32.1',
    '2.32.0',
    '2.31.0',
  ] as const,
  aliases: [] as const,
}

export type RequestsPackage = typeof requestsPackage
