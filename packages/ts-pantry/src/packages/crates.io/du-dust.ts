/**
 * **dust** - A more intuitive version of du in rust
 *
 * @domain `crates.io/du-dust`
 * @programs `dust`
 * @version `1.2.4` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/du-dust`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiodudust
 * console.log(pkg.name)        // "dust"
 * console.log(pkg.description) // "A more intuitive version of du in rust"
 * console.log(pkg.programs)    // ["dust"]
 * console.log(pkg.versions[0]) // "1.2.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/du-dust.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiodudustPackage = {
  /**
   * The display name of this package.
   */
  name: 'dust' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/du-dust' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A more intuitive version of du in rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/du-dust/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/bootandy/dust' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/du-dust' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/du-dust -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/du-dust' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dust',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.4',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiodudustPackage = typeof cratesiodudustPackage
