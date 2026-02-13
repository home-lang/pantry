/**
 * **snyk** - Scans and monitors projects for security vulnerabilities
 *
 * @domain `snyk.io`
 * @programs `snyk`
 * @version `1.1302.1` (57 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install snyk.io`
 * @homepage https://snyk.io
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com@^10` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.snykio
 * console.log(pkg.name)        // "snyk"
 * console.log(pkg.description) // "Scans and monitors projects for security vulner..."
 * console.log(pkg.programs)    // ["snyk"]
 * console.log(pkg.versions[0]) // "1.1302.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/snyk-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const snykioPackage = {
  /**
   * The display name of this package.
   */
  name: 'snyk' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'snyk.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Scans and monitors projects for security vulnerabilities' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/snyk.io/package.yml' as const,
  homepageUrl: 'https://snyk.io' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install snyk.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +snyk.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install snyk.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'snyk',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org^20',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com@^10',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1302.1',
    '1.1302.0',
    '1.1301.2',
    '1.1301.1',
    '1.1301.0',
    '1.1300.2',
    '1.1300.1',
    '1.1300.0',
    '1.1299.1',
    '1.1299.0',
    '1.1298.3',
    '1.1298.2',
    '1.1298.1',
    '1.1298.0',
    '1.1297.3',
    '1.1297.2',
    '1.1297.1',
    '1.1297.0',
    '1.1296.2',
    '1.1296.1',
    '1.1296.0',
    '1.1295.4',
    '1.1295.3',
    '1.1295.2',
    '1.1295.1',
    '1.1295.0',
    '1.1294.3',
    '1.1294.2',
    '1.1294.1',
    '1.1294.0',
    '1.1293.1',
    '1.1293.0',
    '1.1292.4',
    '1.1292.2',
    '1.1292.1',
    '1.1292.0',
    '1.1291.1',
    '1.1291.0',
    '1.1290.0',
    '1.1289.0',
    '1.1288.1',
    '1.1288.0',
    '1.1287.0',
    '1.1286.4',
    '1.1286.3',
    '1.1286.2',
    '1.1286.1',
    '1.1286.0',
    '1.1285.1',
    '1.1285.0',
    '1.1284.0',
    '1.1283.1',
    '1.1283.0',
    '1.1282.1',
    '1.1282.0',
    '1.1281.0',
    '1.1280.1',
  ] as const,
  aliases: [] as const,
}

export type SnykioPackage = typeof snykioPackage
