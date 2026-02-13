/**
 * **lychee** - ⚡ Fast, async, stream-based link checker written in Rust. Finds broken URLs and mail addresses inside Markdown, HTML, reStructuredText, websites and more!
 *
 * @domain `lychee.cli.rs`
 * @programs `lychee`
 * @version `0.15.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lychee.cli.rs`
 * @homepage https://lychee.cli.rs/
 * @dependencies `openssl.org>=1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.lycheeclirs
 * console.log(pkg.name)        // "lychee"
 * console.log(pkg.description) // "⚡ Fast, async, stream-based link checker writte..."
 * console.log(pkg.programs)    // ["lychee"]
 * console.log(pkg.versions[0]) // "0.15.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lychee-cli-rs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lycheeclirsPackage = {
  /**
   * The display name of this package.
   */
  name: 'lychee' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lychee.cli.rs' as const,
  /**
   * Brief description of what this package does.
   */
  description: '⚡ Fast, async, stream-based link checker written in Rust. Finds broken URLs and mail addresses inside Markdown, HTML, reStructuredText, websites and more!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lychee.cli.rs/package.yml' as const,
  homepageUrl: 'https://lychee.cli.rs/' as const,
  githubUrl: 'https://github.com/lycheeverse/lychee' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lychee.cli.rs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lychee.cli.rs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lychee.cli.rs' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lychee',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org>=1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.15.1',
    '0.15.0',
    '0.14.3',
    '0.14.2',
    '0.14.1',
  ] as const,
  aliases: [] as const,
}

export type LycheeclirsPackage = typeof lycheeclirsPackage
