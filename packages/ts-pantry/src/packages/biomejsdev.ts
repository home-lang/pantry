/**
 * **biome** - A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP.
 *
 * @domain `biomejs.dev`
 * @programs `biome`
 * @version `2.3.11` (36 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install biomejs.dev`
 * @homepage https://biomejs.dev/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.biomejsdev
 * console.log(pkg.name)        // "biome"
 * console.log(pkg.description) // "A toolchain for web projects, aimed to provide ..."
 * console.log(pkg.programs)    // ["biome"]
 * console.log(pkg.versions[0]) // "2.3.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/biomejs-dev.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install biomejs.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +biomejs.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install biomejs.dev' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.11',
    '2.3.10',
    '2.3.9',
    '2.3.8',
    '2.3.7',
    '2.3.6',
    '2.3.5',
    '2.3.4',
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
