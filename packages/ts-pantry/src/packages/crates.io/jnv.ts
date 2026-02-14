/**
 * **jnv** - Interactive JSON filter using jq
 *
 * @domain `crates.io/jnv`
 * @programs `jnv`
 * @version `0.6.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/jnv`
 * @buildDependencies `gnu.org/autoconf@2`, `gnu.org/automake@1`, `gnu.org/libtool@2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiojnv
 * console.log(pkg.name)        // "jnv"
 * console.log(pkg.description) // "Interactive JSON filter using jq"
 * console.log(pkg.programs)    // ["jnv"]
 * console.log(pkg.versions[0]) // "0.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/jnv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiojnvPackage = {
  /**
  * The display name of this package.
  */
  name: 'jnv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/jnv' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Interactive JSON filter using jq' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/jnv/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ynqa/jnv' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/jnv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/jnv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/jnv' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'jnv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf@2',
    'gnu.org/automake@1',
    'gnu.org/libtool@2',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.1',
    '0.6.0',
    '0.5.0',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.0',
    '0.2.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiojnvPackage = typeof cratesiojnvPackage
