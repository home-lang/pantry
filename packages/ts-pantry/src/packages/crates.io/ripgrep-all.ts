/**
 * **rga** - rga: ripgrep, but also search in PDFs, E-Books, Office documents, zip, tar.gz, etc.
 *
 * @domain `crates.io/ripgrep-all`
 * @programs `rga`, `rga-fzf`, `rga-fzf-open`, `rga-preproc`
 * @version `0.10.10` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/ripgrep-all`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioripgrepall
 * console.log(pkg.name)        // "rga"
 * console.log(pkg.description) // "rga: ripgrep, but also search in PDFs, E-Books,..."
 * console.log(pkg.programs)    // ["rga", "rga-fzf", ...]
 * console.log(pkg.versions[0]) // "0.10.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/ripgrep-all.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioripgrepallPackage = {
  /**
   * The display name of this package.
   */
  name: 'rga' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/ripgrep-all' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'rga: ripgrep, but also search in PDFs, E-Books, Office documents, zip, tar.gz, etc.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/ripgrep-all/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/phiresky/ripgrep-all' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/ripgrep-all' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/ripgrep-all -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/ripgrep-all' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rga',
    'rga-fzf',
    'rga-fzf-open',
    'rga-preproc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.10',
    '0.10.9',
    '0.10.8',
    '0.10.7',
    '0.10.6',
  ] as const,
  aliases: [] as const,
}

export type CratesioripgrepallPackage = typeof cratesioripgrepallPackage
