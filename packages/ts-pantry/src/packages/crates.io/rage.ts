/**
 * **rage** - A simple, secure and modern file encryption tool (and Rust library) with small explicit keys, no config options, and UNIX-style composability.
 *
 * @domain `crates.io/rage`
 * @programs `rage`, `rage-keygen`
 * @version `0.11.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/rage`
 * @homepage https://str4d.xyz/rage
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiorage
 * console.log(pkg.name)        // "rage"
 * console.log(pkg.description) // "A simple, secure and modern file encryption too..."
 * console.log(pkg.programs)    // ["rage", "rage-keygen"]
 * console.log(pkg.versions[0]) // "0.11.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/rage.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioragePackage = {
  /**
  * The display name of this package.
  */
  name: 'rage' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/rage' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A simple, secure and modern file encryption tool (and Rust library) with small explicit keys, no config options, and UNIX-style composability.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/rage/package.yml' as const,
  homepageUrl: 'https://str4d.xyz/rage' as const,
  githubUrl: 'https://github.com/str4d/rage' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/rage' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/rage -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/rage' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rage',
    'rage-keygen',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.11.1',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.3',
    '0.9.2',
  ] as const,
  aliases: [] as const,
}

export type CratesioragePackage = typeof cratesioragePackage
