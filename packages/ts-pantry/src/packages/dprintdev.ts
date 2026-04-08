/**
 * **dprint** - Pluggable and configurable code formatting platform written in Rust.
 *
 * @domain `dprint.dev`
 * @programs `dprint`
 * @version `0.53.0` (33 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install dprint.dev`
 * @homepage https://dprint.dev/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.dprintdev
 * console.log(pkg.name)        // "dprint"
 * console.log(pkg.description) // "Pluggable and configurable code formatting plat..."
 * console.log(pkg.programs)    // ["dprint"]
 * console.log(pkg.versions[0]) // "0.53.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/dprint-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const dprintdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'dprint' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dprint.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Pluggable and configurable code formatting platform written in Rust.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dprint.dev/package.yml' as const,
  homepageUrl: 'https://dprint.dev/' as const,
  githubUrl: 'https://github.com/dprint/dprint' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install dprint.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dprint.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install dprint.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dprint',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.54.0',
    '0.53.2',
    '0.53.1',
    '0.53.0',
    '0.52.0',
    '0.51.1',
    '0.51.0',
    '0.50.2',
    '0.50.1',
    '0.50.0',
    '0.49.1',
    '0.49.0',
    '0.48.0',
    '0.47.6',
    '0.47.5',
    '0.47.4',
    '0.47.2',
    '0.47.1',
    '0.47.0',
    '0.46.3',
    '0.46.2',
    '0.46.1',
    '0.46.0',
    '0.45.1',
    '0.45.0',
    '0.44.0',
    '0.43.2',
    '0.43.1',
    '0.43.0',
    '0.42.5',
    '0.42.3',
    '0.42.2',
    '0.42.1',
    '0.42.0',
    '0.41.0',
    '0.40.2',
    '0.40.1',
    '0.40.0',
    '0.39.1',
    '0.39.0',
    '0.38.3',
    '0.38.2',
    '0.38.1',
    '0.38.0',
    '0.37.1',
    '0.37.0',
    '0.36.1',
    '0.36.0',
    '0.35.4',
    '0.35.3',
    '0.35.1',
    '0.35.0',
    '0.34.5',
  ] as const,
  aliases: [] as const,
}

export type DprintdevPackage = typeof dprintdevPackage
