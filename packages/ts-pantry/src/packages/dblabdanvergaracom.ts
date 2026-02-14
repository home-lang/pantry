/**
 * **dblab** - The database client every command line junkie deserves.
 *
 * @domain `dblab.danvergara.com`
 * @programs `dblab`
 * @version `0.34.3` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dblab.danvergara.com`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dblabdanvergaracom
 * console.log(pkg.name)        // "dblab"
 * console.log(pkg.description) // "The database client every command line junkie d..."
 * console.log(pkg.programs)    // ["dblab"]
 * console.log(pkg.versions[0]) // "0.34.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dblab-danvergara-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dblabdanvergaracomPackage = {
  /**
  * The display name of this package.
  */
  name: 'dblab' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dblab.danvergara.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The database client every command line junkie deserves.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dblab.danvergara.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/danvergara/dblab' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install dblab.danvergara.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dblab.danvergara.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dblab.danvergara.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dblab',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.34.3',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.1',
    '0.30.0',
    '0.29.0',
    '0.28.1',
    '0.28.0',
    '0.27.0',
    '0.26.0',
    '0.25.0',
    '0.24.1',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.0',
  ] as const,
  aliases: [] as const,
}

export type DblabdanvergaracomPackage = typeof dblabdanvergaracomPackage
