/**
 * **ty** - An extremely fast Python type checker and language server, written in Rust.
 *
 * @domain `astral.sh/ty`
 * @programs `ty`
 * @version `0.0.1.8` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install astral.sh/ty`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.13`, `maturin.rs` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.astralshty
 * console.log(pkg.name)        // "ty"
 * console.log(pkg.description) // "An extremely fast Python type checker and langu..."
 * console.log(pkg.programs)    // ["ty"]
 * console.log(pkg.versions[0]) // "0.0.1.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/astral-sh/ty.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const astralshtyPackage = {
  /**
  * The display name of this package.
  */
  name: 'ty' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'astral.sh/ty' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'An extremely fast Python type checker and language server, written in Rust.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/astral.sh/ty/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/astral-sh/ty' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install astral.sh/ty' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +astral.sh/ty -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install astral.sh/ty' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ty',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@~3.13',
    'maturin.rs',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.0.1.8',
    '0.0.1.7',
    '0.0.1.6',
    '0.0.1.5',
    '0.0.1.4',
    '0.0.1.3',
    '0.0.1.2',
    '0.0.1.1',
    '0.0.0.8',
  ] as const,
  aliases: [] as const,
}

export type AstralshtyPackage = typeof astralshtyPackage
