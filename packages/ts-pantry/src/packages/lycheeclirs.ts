/**
 * **lychee** - ⚡ Fast, async, stream-based link checker written in Rust. Finds broken URLs and mail addresses inside Markdown, HTML, reStructuredText, websites and more!
 *
 * @domain `lychee.cli.rs`
 * @programs `lychee`
 * @version `0.15.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install lychee.cli.rs`
 * @homepage https://lychee.cli.rs/
 * @dependencies `openssl.org>=1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.lycheeclirs
 * console.log(pkg.name)        // "lychee"
 * console.log(pkg.description) // "⚡ Fast, async, stream-based link checker writte..."
 * console.log(pkg.programs)    // ["lychee"]
 * console.log(pkg.versions[0]) // "0.15.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/lychee-cli-rs.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install lychee.cli.rs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lychee.cli.rs -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install lychee.cli.rs' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    'lychee-v0.23.0',
    'lychee-lib-v0.23.0',
    'lychee-v0.22.0',
    'lychee-lib-v0.22.0',
    'lychee-v0.21.0',
    'lychee-lib-v0.21.0',
    'lychee-v0.20.1',
    'lychee-lib-v0.20.1',
    'lychee-v0.20.0',
    'lychee-lib-v0.20.0',
    'lychee-v0.19.1',
    'lychee-lib-v0.19.1',
    'lychee-v0.19.0',
    'lychee-lib-v0.19.0',
    'lychee-v0.18.1',
    'lychee-lib-v0.18.1',
    'lychee-v0.18.0',
    'lychee-lib-v0.18.0',
    'lychee-v0.17.0',
    'lychee-lib-v0.17.0',
  ] as const,
  aliases: [] as const,
}

export type LycheeclirsPackage = typeof lycheeclirsPackage
