/**
 * **fsrx** - 📚 flow state reading in the terminal
 *
 * @domain `crates.io/fsrx`
 * @programs `fsrx`
 * @version `1.0.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/fsrx`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiofsrx
 * console.log(pkg.name)        // "fsrx"
 * console.log(pkg.description) // "📚 flow state reading in the terminal"
 * console.log(pkg.programs)    // ["fsrx"]
 * console.log(pkg.versions[0]) // "1.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/fsrx.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiofsrxPackage = {
  /**
  * The display name of this package.
  */
  name: 'fsrx' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/fsrx' as const,
  /**
  * Brief description of what this package does.
  */
  description: '📚 flow state reading in the terminal' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fsrx/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jrnxf/fsrx' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/fsrx' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/fsrx -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/fsrx' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'fsrx',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.2',
  ] as const,
  aliases: [] as const,
}

export type CratesiofsrxPackage = typeof cratesiofsrxPackage
