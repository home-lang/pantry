/**
 * **plakar** - pkgx package
 *
 * @domain `plakar.io`
 * @programs `plakar`
 * @version `1.0.6` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install plakar.io`
 * @buildDependencies `go.dev@^1.23` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.plakario
 * console.log(pkg.name)        // "plakar"
 * console.log(pkg.programs)    // ["plakar"]
 * console.log(pkg.versions[0]) // "1.0.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/plakar-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const plakarioPackage = {
  /**
  * The display name of this package.
  */
  name: 'plakar' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'plakar.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/plakar.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install plakar.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +plakar.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install plakar.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'plakar',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.23',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.0-beta.7',
    '1.1.0-beta.5',
    '1.1.0-beta.4',
    '1.1.0-beta.3',
    '1.1.0-beta.2',
    '1.1.0-beta.1',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.1-beta.16',
    '1.0.1-beta.15',
    '1.0.1-beta.14',
    '1.0.1-beta.13',
    '1.0.1-beta.12',
    '1.0.0-beta.10',
    '1.0.0-beta.9',
    '1.0.0-beta.5',
    '1.0.0-beta.4',
    '1.0.0-beta.3',
    '1.0.3-rc.2',
    '1.0.0-beta.2',
    '1.0.3-rc.1',
    '1.0.0-beta.1',
    '1.0.3-devel.dc37b62',
    '1.0.3-devel.d5a3fd0',
    '1.0.3-devel.6346f88',
    '1.0.3-devel.889b4b6',
    '1.0.3-devel.455ca52',
    '1.0.3-devel.a593a6a',
    '1.0.3-devel.c7a66f1',
    '0.4.25-alpha',
    '0.4.24-alpha',
    '0.4.23-alpha',
    '0.4.22-alpha',
    '0.4.21-alpha',
    '0.4.20-alpha',
    '0.4.19-alpha',
    '0.4.18-alpha',
    '0.4.17-alpha',
  ] as const,
  aliases: [] as const,
}

export type PlakarioPackage = typeof plakarioPackage
