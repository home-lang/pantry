/**
 * **tidy-viewer** - 📺(tv) Tidy Viewer is a cross-platform CLI csv pretty printer that uses column styling to maximize viewer enjoyment.
 *
 * @domain `crates.io/tidy-viewer`
 * @programs `tidy-viewer`
 * @version `1.8.93` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/tidy-viewer`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotidyviewer
 * console.log(pkg.name)        // "tidy-viewer"
 * console.log(pkg.description) // "📺(tv) Tidy Viewer is a cross-platform CLI csv ..."
 * console.log(pkg.programs)    // ["tidy-viewer"]
 * console.log(pkg.versions[0]) // "1.8.93" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/tidy-viewer.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotidyviewerPackage = {
  /**
   * The display name of this package.
   */
  name: 'tidy-viewer' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/tidy-viewer' as const,
  /**
   * Brief description of what this package does.
   */
  description: '📺(tv) Tidy Viewer is a cross-platform CLI csv pretty printer that uses column styling to maximize viewer enjoyment.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tidy-viewer/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/alexhallam/tv' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/tidy-viewer' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/tidy-viewer -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/tidy-viewer' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tidy-viewer',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.8.93',
    '1.8.92',
    '1.6.5',
    '1.6.0',
    '1.5.2',
  ] as const,
  aliases: [] as const,
}

export type CratesiotidyviewerPackage = typeof cratesiotidyviewerPackage
