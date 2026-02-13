/**
 * **csview** - 📠 Pretty and fast csv viewer for cli with cjk/emoji support.
 *
 * @domain `crates.io/csview`
 * @programs `csview`
 * @version `1.3.4` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/csview`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiocsview
 * console.log(pkg.name)        // "csview"
 * console.log(pkg.description) // "📠 Pretty and fast csv viewer for cli with cjk/..."
 * console.log(pkg.programs)    // ["csview"]
 * console.log(pkg.versions[0]) // "1.3.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/csview.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiocsviewPackage = {
  /**
   * The display name of this package.
   */
  name: 'csview' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/csview' as const,
  /**
   * Brief description of what this package does.
   */
  description: '📠 Pretty and fast csv viewer for cli with cjk/emoji support.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/csview/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/wfxr/csview' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/csview' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/csview -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/csview' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'csview',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.4',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.4',
    '1.2.2',
  ] as const,
  aliases: [] as const,
}

export type CratesiocsviewPackage = typeof cratesiocsviewPackage
