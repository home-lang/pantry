/**
 * **git-branchless** - High-velocity, monorepo-scale workflow for Git
 *
 * @domain `crates.io/git-branchless`
 * @programs `git-branchless`
 * @version `0.11.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/git-branchless`
 * @dependencies `libgit2.org@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cratesiogitbranchless
 * console.log(pkg.name)        // "git-branchless"
 * console.log(pkg.description) // "High-velocity, monorepo-scale workflow for Git"
 * console.log(pkg.programs)    // ["git-branchless"]
 * console.log(pkg.versions[0]) // "0.11.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/crates-io/git-branchless.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cratesiogitbranchlessPackage = {
  /**
  * The display name of this package.
  */
  name: 'git-branchless' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/git-branchless' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'High-velocity, monorepo-scale workflow for Git' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-branchless/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/arxanas/git-branchless' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/git-branchless' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/git-branchless -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/git-branchless' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'git-branchless',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libgit2.org@1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.0',
    '0.5.1',
    '0.5.0',
    '0.4.0',
    '0.3.12',
    '0.3.11',
    '0.3.10',
    '0.3.9',
    '0.3.8',
    '0.3.7',
    '0.3.6',
    '0.3.5',
    '0.3.4',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiogitbranchlessPackage = typeof cratesiogitbranchlessPackage
