/**
 * **railway** - Develop and deploy code with zero configuration
 *
 * @domain `railway.app`
 * @programs `railway`
 * @version `4.33.0` (105 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install railway.app`
 * @homepage https://railway.app/
 * @buildDependencies `darwin:gnu.org/libiconv` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.railwayapp
 * console.log(pkg.name)        // "railway"
 * console.log(pkg.description) // "Develop and deploy code with zero configuration"
 * console.log(pkg.programs)    // ["railway"]
 * console.log(pkg.versions[0]) // "4.33.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/railway-app.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const railwayappPackage = {
  /**
  * The display name of this package.
  */
  name: 'railway' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'railway.app' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Develop and deploy code with zero configuration' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/railway.app/package.yml' as const,
  homepageUrl: 'https://railway.app/' as const,
  githubUrl: 'https://github.com/railwayapp/cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install railway.app' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +railway.app -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install railway.app' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'railway',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'darwin:gnu.org/libiconv',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '5.10.0',
    '5.9.1',
    '5.9.0',
    '5.8.0',
    '5.7.0',
    '5.6.2',
    '5.6.1',
    '5.6.0',
    '5.5.0',
    '5.4.2',
    '5.4.1',
    '5.4.0',
    '5.3.1',
    '5.3.0',
    '5.2.0',
    '5.1.0',
    '5.0.0',
    '4.68.0',
    '4.67.0',
    '4.66.2',
    '4.66.1',
    '4.66.0',
    '4.65.0',
    '4.64.0',
    '4.63.0',
    '4.62.0',
    '4.61.1',
    '4.59.0',
    '4.58.0',
    '4.57.5',
    '4.57.4',
    '4.57.3',
    '4.57.2',
    '4.57.1',
    '4.57.0',
    '4.56.1',
    '4.56.0',
    '4.55.0',
    '4.54.0',
    '4.53.0',
    '4.52.1',
    '4.52.0',
    '4.51.2',
    '4.51.1',
    '4.51.0',
    '4.50.0',
    '4.49.0',
    '4.48.0',
    '4.47.1',
    '4.47.0',
    '4.46.0',
    '4.45.0',
    '4.44.0',
    '4.43.0',
    '4.42.1',
    '4.42.0',
    '4.41.0',
    '4.40.2',
    '4.40.1',
    '4.40.0',
    '4.39.0',
    '4.38.0',
    '4.37.4',
    '4.37.3',
    '4.37.2',
    '4.37.1',
    '4.36.1',
    '4.36.0',
    '4.35.2',
    '4.35.1',
    '4.35.0',
    '4.34.0',
    '4.33.0',
    '4.32.0',
    '4.31.0',
    '4.30.5',
    '4.30.4',
    '4.30.3',
    '4.30.2',
    '4.30.1',
    '4.30.0',
    '4.29.0',
    '4.28.0',
    '4.27.6',
    '4.27.5',
    '4.27.4',
    '4.27.3',
    '4.27.2',
    '4.27.1',
    '4.27.0',
    '4.26.0',
    '4.25.3',
    '4.25.2',
    '4.25.1',
    '4.25.0',
    '4.24.0',
    '4.23.2',
    '4.23.1',
    '4.23.0',
    '4.22.0',
    '4.21.0',
    '4.20.0',
    '4.19.0',
    '4.18.2',
    '4.18.1',
    '4.18.0',
    '4.17.1',
    '4.17.0',
    '4.16.1',
    '4.16.0',
    '4.15.1',
    '4.15.0',
    '4.14.0',
    '4.12.0',
    '4.11.2',
    '4.11.1',
    '4.11.0',
    '4.10.0',
    '4.9.0',
    '4.8.0',
    '4.7.3',
    '4.6.3',
  ] as const,
  aliases: [] as const,
}

export type RailwayappPackage = typeof railwayappPackage
