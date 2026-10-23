/**
 * **projen** - Rapidly build modern applications with advanced configuration management
 *
 * @domain `projen.io`
 * @programs `projen`
 * @version `0.104.12` (196 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install projen.io`
 * @homepage https://projen.io
 * @dependencies `nodejs.org^20 || ^18`
 * @buildDependencies `classic.yarnpkg.com@^1`, `npmjs.com@~11.4.2`, `maven.apache.org@>=3.0.0`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.projenio
 * console.log(pkg.name)        // "projen"
 * console.log(pkg.description) // "Rapidly build modern applications with advanced..."
 * console.log(pkg.programs)    // ["projen"]
 * console.log(pkg.versions[0]) // "0.104.12" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/projen-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const projenioPackage = {
  /**
  * The display name of this package.
  */
  name: 'projen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'projen.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Rapidly build modern applications with advanced configuration management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/projen.io/package.yml' as const,
  homepageUrl: 'https://projen.io' as const,
  githubUrl: 'https://github.com/projen/projen' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install projen.io' as const,
  pantryInstallCommand: 'pantry install projen.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'projen',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org^20 || ^18',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'classic.yarnpkg.com@^1',
    'npmjs.com@~11.4.2',
    'maven.apache.org@>=3.0.0',
    'python.org@~3.11',
    'go.dev@>=1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.104.12',
    '0.104.11',
    '0.104.10',
    '0.104.9',
    '0.104.8',
    '0.104.7',
    '0.104.6',
    '0.104.5',
    '0.104.4',
    '0.104.3',
    '0.104.2',
    '0.104.1',
    '0.104.0',
    '0.103.27',
    '0.103.26',
    '0.103.25',
    '0.103.24',
    '0.103.23',
    '0.103.22',
    '0.103.21',
    '0.103.20',
    '0.103.19',
    '0.103.18',
    '0.103.17',
    '0.103.16',
    '0.103.15',
    '0.103.14',
    '0.103.13',
    '0.103.12',
    '0.103.11',
    '0.103.10',
    '0.103.9',
    '0.103.8',
    '0.103.7',
    '0.103.6',
    '0.103.5',
    '0.103.4',
    '0.103.3',
    '0.103.2',
    '0.103.1',
    '0.103.0',
    '0.102.0',
    '0.101.37',
    '0.101.36',
    '0.101.35',
    '0.101.34',
    '0.101.33',
    '0.101.32',
    '0.101.31',
    '0.101.30',
    '0.101.29',
    '0.101.28',
    '0.101.27',
    '0.101.26',
    '0.101.25',
    '0.101.24',
    '0.101.23',
    '0.101.22',
    '0.101.21',
    '0.101.20',
    '0.101.19',
    '0.101.18',
    '0.101.17',
    '0.101.16',
    '0.101.15',
    '0.101.14',
    '0.101.13',
    '0.101.12',
    '0.101.11',
    '0.101.10',
    '0.101.9',
    '0.101.8',
    '0.101.7',
    '0.101.6',
    '0.101.5',
    '0.101.4',
    '0.101.3',
    '0.101.2',
    '0.101.1',
    '0.101.0',
    '0.100.7',
    '0.100.6',
    '0.100.5',
    '0.100.4',
    '0.100.3',
    '0.100.2',
    '0.100.1',
    '0.100.0',
    '0.99.80',
    '0.99.79',
    '0.99.78',
    '0.99.77',
    '0.99.76',
    '0.99.75',
    '0.99.74',
    '0.99.73',
    '0.99.72',
    '0.99.71',
    '0.99.70',
    '0.99.69',
    '0.99.68',
    '0.99.67',
    '0.99.66',
    '0.99.65',
    '0.99.64',
    '0.99.63',
    '0.99.62',
    '0.99.61',
    '0.99.60',
    '0.99.59',
    '0.99.58',
    '0.99.57',
    '0.99.56',
    '0.99.55',
    '0.99.54',
    '0.99.53',
    '0.99.52',
    '0.99.51',
    '0.99.50',
    '0.99.49',
    '0.99.48',
    '0.99.47',
    '0.99.46',
    '0.99.45',
    '0.99.44',
    '0.99.43',
    '0.99.42',
    '0.99.41',
    '0.99.40',
    '0.99.39',
    '0.99.38',
    '0.99.37',
    '0.99.36',
    '0.99.35',
    '0.99.34',
    '0.99.33',
    '0.99.32',
    '0.99.31',
    '0.99.30',
    '0.99.29',
    '0.99.28',
    '0.99.27',
    '0.99.26',
    '0.99.25',
    '0.99.24',
    '0.99.23',
    '0.99.22',
    '0.99.21',
    '0.99.20',
    '0.99.19',
    '0.99.18',
    '0.99.17',
    '0.99.16',
    '0.99.15',
    '0.99.14',
    '0.99.13',
    '0.99.12',
    '0.99.11',
    '0.99.10',
    '0.99.9',
    '0.99.8',
    '0.99.7',
    '0.99.6',
    '0.99.5',
    '0.99.4',
    '0.99.3',
    '0.99.2',
    '0.99.1',
    '0.99.0',
    '0.98.34',
    '0.98.33',
    '0.98.32',
    '0.98.31',
    '0.98.30',
    '0.98.29',
    '0.98.28',
    '0.98.27',
    '0.98.26',
    '0.98.25',
    '0.98.24',
    '0.98.23',
    '0.98.22',
    '0.98.21',
    '0.98.20',
    '0.98.19',
    '0.98.18',
    '0.98.17',
    '0.98.16',
    '0.98.15',
    '0.98.14',
    '0.98.13',
    '0.98.12',
    '0.98.11',
    '0.98.10',
    '0.98.9',
    '0.98.8',
  ] as const,
  aliases: [] as const,
}

export type ProjenioPackage = typeof projenioPackage
