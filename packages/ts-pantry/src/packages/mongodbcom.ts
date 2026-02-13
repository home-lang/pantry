/**
 * **mongodb** - The MongoDB Database
 *
 * @domain `mongodb.com`
 * @programs `install_compass`, `mongod`, `mongos`
 * @version `8.2.3` (54 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mongodb.com`
 * @homepage https://www.mongodb.com/
 * @dependencies `curl.se@8`, `openssl.org@1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mongodbcom
 * console.log(pkg.name)        // "mongodb"
 * console.log(pkg.description) // "The MongoDB Database"
 * console.log(pkg.programs)    // ["install_compass", "mongod", ...]
 * console.log(pkg.versions[0]) // "8.2.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mongodb-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mongodbcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'mongodb' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mongodb.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The MongoDB Database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mongodb.com/package.yml' as const,
  homepageUrl: 'https://www.mongodb.com/' as const,
  githubUrl: 'https://github.com/mongodb/mongo' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mongodb.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mongodb.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mongodb.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'install_compass',
    'mongod',
    'mongos',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se@8',
    'openssl.org@1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.2.3',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.1.3',
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.17',
    '8.0.16',
    '8.0.15',
    '8.0.14',
    '8.0.13',
    '8.0.12',
    '8.0.11',
    '8.0.10',
    '8.0.9',
    '8.0.8',
    '8.0.7',
    '8.0.6',
    '8.0.5',
    '8.0.4',
    '8.0.3',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.3.4',
    '7.3.3',
    '7.0.28',
    '7.0.27',
    '7.0.26',
    '7.0.25',
    '7.0.24',
    '7.0.23',
    '7.0.22',
    '7.0.21',
    '7.0.20',
    '7.0.19',
    '7.0.18',
    '7.0.17',
    '7.0.16',
    '7.0.15',
    '7.0.14',
    '6.0.27',
    '6.0.26',
    '6.0.25',
    '6.0.24',
    '6.0.23',
    '6.0.22',
    '6.0.21',
    '6.0.20',
    '6.0.19',
    '6.0.18',
    '6.0.17',
  ] as const,
  aliases: [] as const,
}

export type MongodbcomPackage = typeof mongodbcomPackage
