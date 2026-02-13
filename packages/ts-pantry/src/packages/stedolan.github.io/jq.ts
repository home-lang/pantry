/**
 * **jq** - Lightweight and flexible command-line JSON processor
 *
 * @domain `stedolan.github.io/jq`
 * @programs `jq`
 * @version `1.8.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install stedolan.github.io/jq`
 * @homepage https://jqlang.github.io/jq/
 * @dependencies `github.com/kkos/oniguruma@6`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.stedolangithubiojq
 * console.log(pkg.name)        // "jq"
 * console.log(pkg.description) // "Lightweight and flexible command-line JSON proc..."
 * console.log(pkg.programs)    // ["jq"]
 * console.log(pkg.versions[0]) // "1.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/stedolan-github-io/jq.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const stedolangithubiojqPackage = {
  /**
   * The display name of this package.
   */
  name: 'jq' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'stedolan.github.io/jq' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Lightweight and flexible command-line JSON processor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/stedolan.github.io/jq/package.yml' as const,
  homepageUrl: 'https://jqlang.github.io/jq/' as const,
  githubUrl: 'https://github.com/jqlang/jq' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install stedolan.github.io/jq' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +stedolan.github.io/jq -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install stedolan.github.io/jq' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jq',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'github.com/kkos/oniguruma@6',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.8.1',
    '1.8.0',
    '1.7.1',
    '1.7.0',
    '1.6.0',
  ] as const,
  aliases: [] as const,
}

export type StedolangithubiojqPackage = typeof stedolangithubiojqPackage
