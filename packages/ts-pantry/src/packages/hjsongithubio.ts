/**
 * **hjson** - Hjson for Rust
 *
 * @domain `hjson.github.io`
 * @programs `hjson`
 * @version `1.1.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hjson.github.io`
 * @homepage https://hjson.github.io/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hjsongithubio
 * console.log(pkg.name)        // "hjson"
 * console.log(pkg.description) // "Hjson for Rust"
 * console.log(pkg.programs)    // ["hjson"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hjson-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hjsongithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'hjson' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'hjson.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Hjson for Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hjson.github.io/package.yml' as const,
  homepageUrl: 'https://hjson.github.io/' as const,
  githubUrl: 'https://github.com/hjson/hjson-rust' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install hjson.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hjson.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hjson.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'hjson',
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
  ] as const,
  aliases: [] as const,
}

export type HjsongithubioPackage = typeof hjsongithubioPackage
