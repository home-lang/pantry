/**
 * **Scryer Prolog** - Modern ISO Prolog implementation written mostly in Rust
 *
 * @domain `scryer.pl`
 * @programs `scryer-prolog`
 * @version `0.10.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install scryer.pl`
 * @homepage https://www.scryer.pl
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.scryerpl
 * console.log(pkg.name)        // "Scryer Prolog"
 * console.log(pkg.description) // "Modern ISO Prolog implementation written mostly..."
 * console.log(pkg.programs)    // ["scryer-prolog"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/scryer-pl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const scryerplPackage = {
  /**
  * The display name of this package.
  */
  name: 'Scryer Prolog' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'scryer.pl' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Modern ISO Prolog implementation written mostly in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/scryer.pl/package.yml' as const,
  homepageUrl: 'https://www.scryer.pl' as const,
  githubUrl: 'https://github.com/mthom/scryer-prolog' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install scryer.pl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +scryer.pl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install scryer.pl' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'scryer-prolog',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.0',
    '0.9.4',
  ] as const,
  aliases: [] as const,
}

export type ScryerplPackage = typeof scryerplPackage
