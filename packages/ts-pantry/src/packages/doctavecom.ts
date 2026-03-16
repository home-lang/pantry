/**
 * **doctave** - A batteries-included developer documentation site generator
 *
 * @domain `doctave.com`
 * @programs `doctave`
 * @version `0.4.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install doctave.com`
 * @homepage https://cli.doctave.com
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.doctavecom
 * console.log(pkg.name)        // "doctave"
 * console.log(pkg.description) // "A batteries-included developer documentation si..."
 * console.log(pkg.programs)    // ["doctave"]
 * console.log(pkg.versions[0]) // "0.4.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/doctave-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const doctavecomPackage = {
  /**
  * The display name of this package.
  */
  name: 'doctave' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'doctave.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A batteries-included developer documentation site generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/doctave.com/package.yml' as const,
  homepageUrl: 'https://cli.doctave.com' as const,
  githubUrl: 'https://github.com/Doctave/doctave' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install doctave.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +doctave.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install doctave.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'doctave',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.2',
  ] as const,
  aliases: [] as const,
}

export type DoctavecomPackage = typeof doctavecomPackage
