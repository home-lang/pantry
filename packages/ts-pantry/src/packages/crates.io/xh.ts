/**
 * **xh** - Friendly and fast tool for sending HTTP requests
 *
 * @domain `crates.io/xh`
 * @programs `xh`
 * @version `0.25.3` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/xh`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioxh
 * console.log(pkg.name)        // "xh"
 * console.log(pkg.description) // "Friendly and fast tool for sending HTTP requests"
 * console.log(pkg.programs)    // ["xh"]
 * console.log(pkg.versions[0]) // "0.25.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/xh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioxhPackage = {
  /**
  * The display name of this package.
  */
  name: 'xh' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/xh' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Friendly and fast tool for sending HTTP requests' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/xh/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ducaale/xh' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/xh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/xh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/xh' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xh',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.25.3',
    '0.25.0',
    '0.24.1',
    '0.24.0',
    '0.23.1',
    '0.23.0',
    '0.22.2',
  ] as const,
  aliases: [] as const,
}

export type CratesioxhPackage = typeof cratesioxhPackage
