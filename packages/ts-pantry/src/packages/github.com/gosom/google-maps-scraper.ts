/**
 * **google-maps-scraper** - scrape data  data from Google Maps. Extracts data such as the name, address, phone number, website URL, rating,  reviews number, latitude and longitude, reviews,email and more for each place
 *
 * @domain `github.com/gosom/google-maps-scraper`
 * @programs `google-maps-scraper`
 * @version `1.10.1` (51 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/gosom/google-maps-scraper`
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.21.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgosomgooglemapsscraper
 * console.log(pkg.name)        // "google-maps-scraper"
 * console.log(pkg.description) // "scrape data  data from Google Maps. Extracts da..."
 * console.log(pkg.programs)    // ["google-maps-scraper"]
 * console.log(pkg.versions[0]) // "1.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/gosom/google-maps-scraper.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlemapsscraperPackage = {
  /**
   * The display name of this package.
   */
  name: 'google-maps-scraper' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/gosom/google-maps-scraper' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'scrape data  data from Google Maps. Extracts data such as the name, address, phone number, website URL, rating,  reviews number, latitude and longitude, reviews,email and more for each place' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/gosom/google-maps-scraper/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/gosom/google-maps-scraper' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/gosom/google-maps-scraper' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/gosom/google-maps-scraper -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/gosom/google-maps-scraper' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'google-maps-scraper',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21.1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.10.1',
    '1.10.0',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.8',
    '1.8.7',
    '1.8.6',
    '1.8.5',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.14',
    '1.7.13',
    '1.7.12',
    '1.7.10',
    '1.7.9',
    '1.7.8',
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.6',
    '1.3.5',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.4',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.3',
    '1.1.2',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type GooglemapsscraperPackage = typeof googlemapsscraperPackage
