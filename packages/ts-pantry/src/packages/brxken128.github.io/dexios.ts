/**
 * **dexios** - A secure file encryption utility, written in Rust.
 *
 * @domain `brxken128.github.io/dexios`
 * @programs `dexios`
 * @version `8.8.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install brxken128.github.io/dexios`
 * @homepage https://brxken128.github.io/dexios/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.brxken128githubiodexios
 * console.log(pkg.name)        // "dexios"
 * console.log(pkg.description) // "A secure file encryption utility, written in Rust."
 * console.log(pkg.programs)    // ["dexios"]
 * console.log(pkg.versions[0]) // "8.8.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/brxken128-github-io/dexios.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const brxken128githubiodexiosPackage = {
  /**
  * The display name of this package.
  */
  name: 'dexios' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'brxken128.github.io/dexios' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A secure file encryption utility, written in Rust.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/brxken128.github.io/dexios/package.yml' as const,
  homepageUrl: 'https://brxken128.github.io/dexios/' as const,
  githubUrl: 'https://github.com/brxken128/dexios' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install brxken128.github.io/dexios' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +brxken128.github.io/dexios -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install brxken128.github.io/dexios' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dexios',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '8.8.1',
  ] as const,
  aliases: [] as const,
}

export type Brxken128githubiodexiosPackage = typeof brxken128githubiodexiosPackage
