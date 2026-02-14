/**
 * **zellij** - Pluggable terminal workspace, with terminal multiplexer as the base feature
 *
 * @domain `crates.io/zellij`
 * @programs `zellij`
 * @version `0.43.1` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/zellij`
 * @homepage https://zellij.dev
 * @dependencies `zlib.net^1`, `curl.se@8`
 * @buildDependencies `openssl.org@^1.1`, `perl.org@^5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiozellij
 * console.log(pkg.name)        // "zellij"
 * console.log(pkg.description) // "Pluggable terminal workspace, with terminal mul..."
 * console.log(pkg.programs)    // ["zellij"]
 * console.log(pkg.versions[0]) // "0.43.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/zellij.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiozellijPackage = {
  /**
  * The display name of this package.
  */
  name: 'zellij' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/zellij' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Pluggable terminal workspace, with terminal multiplexer as the base feature' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/zellij/package.yml' as const,
  homepageUrl: 'https://zellij.dev' as const,
  githubUrl: 'https://github.com/zellij-org/zellij' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/zellij' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/zellij -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/zellij' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'zellij',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net^1',
    'curl.se@8',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'openssl.org@^1.1',
    'perl.org@^5',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.43.1',
    '0.43.0',
    '0.42.2',
    '0.42.1',
    '0.42.0',
    '0.41.2',
    '0.41.1',
    '0.41.0',
    '0.40.1',
    '0.40.0',
    '0.39.2',
    '0.39.1',
    '0.39.0',
    '0.38.2',
    '0.38.1',
    '0.38.0',
    '0.37.2',
    '0.37.1',
    '0.37.0',
    '0.36.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiozellijPackage = typeof cratesiozellijPackage
