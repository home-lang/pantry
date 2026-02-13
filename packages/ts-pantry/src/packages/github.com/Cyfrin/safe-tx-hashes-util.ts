/**
 * **safe_hashes** - pkgx package
 *
 * @domain `github.com/Cyfrin/safe-tx-hashes-util`
 * @programs `safe_hashes`
 * @version `0.1.4` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Cyfrin/safe-tx-hashes-util`
 * @dependencies `gnu.org/bash>=4`, `gnu.org/gcc/libstdcxx^14 # solc wants GLIBCXX_3.4.26`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcyfrinsafetxhashesutil
 * console.log(pkg.name)        // "safe_hashes"
 * console.log(pkg.programs)    // ["safe_hashes"]
 * console.log(pkg.versions[0]) // "0.1.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Cyfrin/safe-tx-hashes-util.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const safetxhashesutilPackage = {
  /**
   * The display name of this package.
   */
  name: 'safe_hashes' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/Cyfrin/safe-tx-hashes-util' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Cyfrin/safe-tx-hashes-util/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Cyfrin/safe-tx-hashes-util' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/Cyfrin/safe-tx-hashes-util' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Cyfrin/safe-tx-hashes-util -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Cyfrin/safe-tx-hashes-util' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'safe_hashes',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/bash>=4',
    'gnu.org/gcc/libstdcxx^14 # solc wants GLIBCXX_3.4.26',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.4',
    '0.1.3',
  ] as const,
  aliases: [] as const,
}

export type SafetxhashesutilPackage = typeof safetxhashesutilPackage
