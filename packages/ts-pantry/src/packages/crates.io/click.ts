/**
 * **click** - The "Command Line Interactive Controller for Kubernetes"
 *
 * @domain `crates.io/click`
 * @programs `click`
 * @version `0.6.3` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/click`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioclick
 * console.log(pkg.name)        // "click"
 * console.log(pkg.description) // "The "Command Line Interactive Controller for Ku..."
 * console.log(pkg.programs)    // ["click"]
 * console.log(pkg.versions[0]) // "0.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/click.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioclickPackage = {
  /**
  * The display name of this package.
  */
  name: 'click' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/click' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The "Command Line Interactive Controller for Kubernetes"' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/click/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/databricks/click' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/click' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/click -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/click' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'click',
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
    '0.6.3',
    '0.6.2',
  ] as const,
  aliases: [] as const,
}

export type CratesioclickPackage = typeof cratesioclickPackage
