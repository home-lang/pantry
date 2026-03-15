/**
 * **ripgrep** - ripgrep recursively searches directories for a regex pattern while respecting your gitignore
 *
 * @domain `crates.io/ripgrep`
 * @programs `rg`
 * @version `15.1.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/ripgrep`
 * @name `rg`
 * @aliases `ripgrep`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.ripgrep
 * // Or access via domain
 * const samePkg = pantry.cratesioripgrep
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "rg"
 * console.log(pkg.description) // "ripgrep recursively searches directories for a ..."
 * console.log(pkg.programs)    // ["rg"]
 * console.log(pkg.versions[0]) // "15.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/ripgrep.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ripgrepPackage = {
  /**
  * The display name of this package.
  */
  name: 'rg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/ripgrep' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'ripgrep recursively searches directories for a regex pattern while respecting your gitignore' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/ripgrep/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/BurntSushi/ripgrep' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/ripgrep' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/ripgrep -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/ripgrep' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rg',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '15.1.0',
    '15.0.0',
    '14.1.1',
    '14.1.0',
    '14.0.3',
    '14.0.2',
    '14.0.1',
    '14.0.0',
    '13.0.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'ripgrep',
  ] as const,
}

export type RipgrepPackage = typeof ripgrepPackage
