/**
 * **mdbook** - Create book from markdown files. Like Gitbook but implemented in Rust
 *
 * @domain `rust-lang.github.io/mdBook`
 * @programs `mdbook`
 * @version `0.5.2` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rust-lang.github.io/mdBook`
 * @homepage https://rust-lang.github.io/mdBook/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rustlanggithubiomdbook
 * console.log(pkg.name)        // "mdbook"
 * console.log(pkg.description) // "Create book from markdown files. Like Gitbook b..."
 * console.log(pkg.programs)    // ["mdbook"]
 * console.log(pkg.versions[0]) // "0.5.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rust-lang-github-io/mdBook.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rustlanggithubiomdbookPackage = {
  /**
  * The display name of this package.
  */
  name: 'mdbook' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rust-lang.github.io/mdBook' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Create book from markdown files. Like Gitbook but implemented in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.github.io/mdBook/package.yml' as const,
  homepageUrl: 'https://rust-lang.github.io/mdBook/' as const,
  githubUrl: 'https://github.com/rust-lang/mdBook' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rust-lang.github.io/mdBook' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rust-lang.github.io/mdBook -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rust-lang.github.io/mdBook' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mdbook',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.52',
    '0.4.51',
    '0.4.50',
    '0.4.49',
    '0.4.48',
    '0.4.47',
    '0.4.46',
    '0.4.45',
    '0.4.44',
    '0.4.43',
    '0.4.42',
    '0.4.41',
    '0.4.40',
    '0.4.39',
    '0.4.38',
    '0.4.37',
    '0.4.36',
    '0.4.35',
    '0.4.34',
  ] as const,
  aliases: [] as const,
}

export type RustlanggithubiomdbookPackage = typeof rustlanggithubiomdbookPackage
