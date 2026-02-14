/**
 * **kaspa-miner** - A fast CPU miner for Kaspa
 *
 * @domain `crates.io/kaspa-miner`
 * @programs `kaspa-miner`
 * @version `0.2.5` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/kaspa-miner`
 * @buildDependencies `protobuf.dev@25` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiokaspaminer
 * console.log(pkg.name)        // "kaspa-miner"
 * console.log(pkg.description) // "A fast CPU miner for Kaspa"
 * console.log(pkg.programs)    // ["kaspa-miner"]
 * console.log(pkg.versions[0]) // "0.2.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/kaspa-miner.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiokaspaminerPackage = {
  /**
  * The display name of this package.
  */
  name: 'kaspa-miner' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/kaspa-miner' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A fast CPU miner for Kaspa' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/kaspa-miner/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/elichai/kaspa-miner' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/kaspa-miner' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/kaspa-miner -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/kaspa-miner' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kaspa-miner',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'protobuf.dev@25',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.5',
    '0.2.4',
    '0.2.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiokaspaminerPackage = typeof cratesiokaspaminerPackage
