/**
 * **mergestat** - Query git repositories with SQL. Generate reports, perform status checks, analyze codebases. 🔍 📊
 *
 * @domain `mergestat.com/mergestat-lite`
 * @programs `mergestat`
 * @version `0.6.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mergestat.com/mergestat-lite`
 * @homepage https://mergestat.com/
 * @buildDependencies `go.dev@^1.19`, `cmake.org`, `libgit2.org@~1.7`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mergestatcommergestatlite
 * console.log(pkg.name)        // "mergestat"
 * console.log(pkg.description) // "Query git repositories with SQL. Generate repor..."
 * console.log(pkg.programs)    // ["mergestat"]
 * console.log(pkg.versions[0]) // "0.6.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mergestat-com/mergestat-lite.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mergestatcommergestatlitePackage = {
  /**
  * The display name of this package.
  */
  name: 'mergestat' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mergestat.com/mergestat-lite' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Query git repositories with SQL. Generate reports, perform status checks, analyze codebases. 🔍 📊' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mergestat.com/mergestat-lite/package.yml' as const,
  homepageUrl: 'https://mergestat.com/' as const,
  githubUrl: 'https://github.com/mergestat/mergestat-lite' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mergestat.com/mergestat-lite' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mergestat.com/mergestat-lite -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mergestat.com/mergestat-lite' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mergestat',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
    'cmake.org',
    'libgit2.org@~1.7',
    'openssl.org',
    'python.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.2',
    '0.6.1',
  ] as const,
  aliases: [] as const,
}

export type MergestatcommergestatlitePackage = typeof mergestatcommergestatlitePackage
