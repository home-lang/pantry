/**
 * **d2** - D2 is a modern diagram scripting language that turns text to diagrams.
 *
 * @domain `d2lang.com`
 * @programs `d2`
 * @version `0.7.1` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install d2lang.com`
 * @homepage https://d2lang.com/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.d2langcom
 * console.log(pkg.name)        // "d2"
 * console.log(pkg.description) // "D2 is a modern diagram scripting language that ..."
 * console.log(pkg.programs)    // ["d2"]
 * console.log(pkg.versions[0]) // "0.7.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/d2lang-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const d2langcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'd2' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'd2lang.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'D2 is a modern diagram scripting language that turns text to diagrams.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/d2lang.com/package.yml' as const,
  homepageUrl: 'https://d2lang.com/' as const,
  githubUrl: 'https://github.com/terrastruct/d2' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install d2lang.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +d2lang.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install d2lang.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'd2',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.7.1',
    '0.7.0',
    '0.6.9',
    '0.6.8',
    '0.6.7',
    '0.6.6',
    '0.6.5',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.1',
    '0.5.0',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.0',
    '0.2.6',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
    '0.0.13',
    '0.0.12',
  ] as const,
  aliases: [] as const,
}

export type D2langcomPackage = typeof d2langcomPackage
