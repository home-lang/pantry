/**
 * **hyperfine** - A command-line benchmarking tool
 *
 * @domain `crates.io/hyperfine`
 * @programs `hyperfine`
 * @version `1.20.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/hyperfine`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cratesiohyperfine
 * console.log(pkg.name)        // "hyperfine"
 * console.log(pkg.description) // "A command-line benchmarking tool"
 * console.log(pkg.programs)    // ["hyperfine"]
 * console.log(pkg.versions[0]) // "1.20.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/crates-io/hyperfine.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cratesiohyperfinePackage = {
  /**
  * The display name of this package.
  */
  name: 'hyperfine' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/hyperfine' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A command-line benchmarking tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/hyperfine/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sharkdp/hyperfine' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/hyperfine' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/hyperfine -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/hyperfine' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'hyperfine',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.20.0',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.0',
    '0.5.0',
    '0.4.0',
    '0.3.0',
    '0.2.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiohyperfinePackage = typeof cratesiohyperfinePackage
