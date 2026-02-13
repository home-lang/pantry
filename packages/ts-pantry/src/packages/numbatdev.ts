/**
 * **numbat** - A statically typed programming language for scientific computations with first class support for physical dimensions and units
 *
 * @domain `numbat.dev`
 * @programs `numbat`
 * @version `1.19.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install numbat.dev`
 * @homepage https://numbat.dev
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.numbatdev
 * console.log(pkg.name)        // "numbat"
 * console.log(pkg.description) // "A statically typed programming language for sci..."
 * console.log(pkg.programs)    // ["numbat"]
 * console.log(pkg.versions[0]) // "1.19.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/numbat-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const numbatdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'numbat' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'numbat.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A statically typed programming language for scientific computations with first class support for physical dimensions and units' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/numbat.dev/package.yml' as const,
  homepageUrl: 'https://numbat.dev' as const,
  githubUrl: 'https://github.com/sharkdp/numbat' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install numbat.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +numbat.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install numbat.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'numbat',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.0',
    '1.10.1',
    '1.10.0',
    '1.9.0',
    '1.8.0',
  ] as const,
  aliases: [] as const,
}

export type NumbatdevPackage = typeof numbatdevPackage
