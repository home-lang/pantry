/**
 * **zotregistry** - pkgx package
 *
 * @domain `zotregistry.dev`
 * @programs `zb`, `zli`, `zot`, `zxp`
 * @version `2.1.15` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install zotregistry.dev`
 * @buildDependencies `npmjs.com`, `go.dev@^1.25` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.zotregistrydev
 * console.log(pkg.name)        // "zotregistry"
 * console.log(pkg.programs)    // ["zb", "zli", ...]
 * console.log(pkg.versions[0]) // "2.1.15" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/zotregistry-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const zotregistrydevPackage = {
  /**
  * The display name of this package.
  */
  name: 'zotregistry' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'zotregistry.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/zotregistry.dev/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/project-zot/zot' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install zotregistry.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +zotregistry.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install zotregistry.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'zb',
    'zli',
    'zot',
    'zxp',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com',
    'go.dev@^1.25',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.16',
    '2.1.15',
    '2.1.14',
    '2.1.13',
    '2.1.12',
    '2.1.11',
    '2.1.10',
    '2.1.9',
    '2.1.8',
    '2.1.7',
    '2.1.6',
    '2.1.5',
    '2.1.4',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.4.3',
  ] as const,
  aliases: [] as const,
}

export type ZotregistrydevPackage = typeof zotregistrydevPackage
