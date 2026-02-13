/**
 * **mongosh** - MongoDB Shell to connect, configure, query, and work with your MongoDB database
 *
 * @domain `mongodb.com/shell`
 * @programs `mongosh`
 * @version `2.6.0` (42 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mongodb.com/shell`
 * @homepage https://www.mongodb.com/try/download/shell
 * @dependencies `nodejs.org`
 * @buildDependencies `npmjs.com`, `curl.se`, `python.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mongodbcomshell
 * console.log(pkg.name)        // "mongosh"
 * console.log(pkg.description) // "MongoDB Shell to connect, configure, query, and..."
 * console.log(pkg.programs)    // ["mongosh"]
 * console.log(pkg.versions[0]) // "2.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mongodb-com/shell.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mongodbcomshellPackage = {
  /**
   * The display name of this package.
   */
  name: 'mongosh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mongodb.com/shell' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'MongoDB Shell to connect, configure, query, and work with your MongoDB database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mongodb.com/shell/package.yml' as const,
  homepageUrl: 'https://www.mongodb.com/try/download/shell' as const,
  githubUrl: 'https://github.com/mongodb-js/mongosh' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mongodb.com/shell' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mongodb.com/shell -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mongodb.com/shell' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mongosh',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com',
    'curl.se',
    'python.org@3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.6.0',
    '2.5.10',
    '2.5.9',
    '2.5.8',
    '2.5.7',
    '2.5.6',
    '2.5.5',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.2',
    '2.4.0',
    '2.3.9',
    '2.3.8',
    '2.3.7',
    '2.3.6',
    '2.3.5',
    '2.3.4',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.15',
    '2.2.12',
    '2.2.11',
    '2.2.10',
    '2.2.9',
    '2.2.6',
    '2.2.5',
    '2.2.4',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.5',
    '2.1.4',
    '2.1.3',
    '2.1.1',
    '2.1.0',
    '2.0.2',
    '2.0.1',
  ] as const,
  aliases: [] as const,
}

export type MongodbcomshellPackage = typeof mongodbcomshellPackage
