/**
 * **pocketbase** - Open source backend for your next project in 1 file
 *
 * @domain `pocketbase.io`
 * @programs `pocketbase`
 * @version `0.36.6` (109 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pocketbase.io`
 * @homepage https://pocketbase.io/
 * @buildDependencies `go.dev@>=1.16` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.pocketbaseio
 * console.log(pkg.name)        // "pocketbase"
 * console.log(pkg.description) // "Open source backend for your next project in 1 ..."
 * console.log(pkg.programs)    // ["pocketbase"]
 * console.log(pkg.versions[0]) // "0.36.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/pocketbase-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const pocketbaseioPackage = {
  /**
  * The display name of this package.
  */
  name: 'pocketbase' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pocketbase.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Open source backend for your next project in 1 file' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pocketbase.io/package.yml' as const,
  homepageUrl: 'https://pocketbase.io/' as const,
  githubUrl: 'https://github.com/pocketbase/pocketbase' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pocketbase.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pocketbase.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install pocketbase.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pocketbase',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@>=1.16',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.36.7',
    '0.36.6',
    '0.36.5',
    '0.36.4',
    '0.36.3',
    '0.36.2',
    '0.36.1',
    '0.36.0',
    '0.35.1',
    '0.35.0',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.4',
    '0.30.3',
    '0.30.2',
    '0.30.1',
  ] as const,
  aliases: [] as const,
}

export type PocketbaseioPackage = typeof pocketbaseioPackage
