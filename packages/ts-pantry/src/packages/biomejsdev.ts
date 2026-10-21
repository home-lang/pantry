/**
 * **biome** - A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP.
 *
 * @domain `biomejs.dev`
 * @programs `biome`
 * @version `2.6.2` (80 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install biomejs.dev`
 * @homepage https://biomejs.dev/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.biomejsdev
 * console.log(pkg.name)        // "biome"
 * console.log(pkg.description) // "A toolchain for web projects, aimed to provide ..."
 * console.log(pkg.programs)    // ["biome"]
 * console.log(pkg.versions[0]) // "2.6.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/biomejs-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const biomejsdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'biome' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'biomejs.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/biomejs.dev/package.yml' as const,
  homepageUrl: 'https://biomejs.dev/' as const,
  githubUrl: 'https://github.com/biomejs/biome' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install biomejs.dev' as const,
  pantryInstallCommand: 'pantry install biomejs.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'biome',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.6.2',
    '2.5.15',
    '2.5.14',
    '2.5.13',
    '2.5.12',
    '2.5.11',
    '2.5.10',
    '2.5.9',
    '2.5.8',
    '2.5.7',
    '2.5.6',
    '2.5.5',
    '2.5.4',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.16',
    '2.4.15',
    '2.4.14',
    '2.4.13',
    '2.4.12',
    '2.4.11',
    '2.4.10',
    '2.4.9',
    '2.4.8',
    '2.4.7',
    '2.4.6',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.15',
    '2.3.14',
    '2.3.13',
    '2.3.12',
    '2.3.11',
    '2.3.10',
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
    '2.2.7',
    '2.2.6',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.3',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.4',
    '1.6.3',
    '1.6.2',
    '1.6.1',
    '1.6.0',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.3',
    '1.3.1',
    '1.3.0',
    '1.2.2',
  ] as const,
  aliases: [] as const,
}

export type BiomejsdevPackage = typeof biomejsdevPackage
