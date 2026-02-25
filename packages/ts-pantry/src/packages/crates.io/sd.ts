/**
 * **sd** - Intuitive find & replace CLI (sed alternative)
 *
 * @domain `crates.io/sd`
 * @programs `sd`
 * @version `1.1.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/sd`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiosd
 * console.log(pkg.name)        // "sd"
 * console.log(pkg.description) // "Intuitive find & replace CLI (sed alternative)"
 * console.log(pkg.programs)    // ["sd"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/sd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiosdPackage = {
  /**
  * The display name of this package.
  */
  name: 'sd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/sd' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Intuitive find & replace CLI (sed alternative)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sd/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/chmln/sd' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/sd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/sd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/sd' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sd',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.0',
    '1.0.0',
    '0.7.6',
  ] as const,
  aliases: [] as const,
}

export type CratesiosdPackage = typeof cratesiosdPackage
