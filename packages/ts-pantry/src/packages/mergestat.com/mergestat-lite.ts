/**
 * **mergestat** - Query git repositories with SQL. Generate reports, perform status checks, analyze codebases. 🔍 📊
 *
 * @domain `mergestat.com/mergestat-lite`
 * @programs `mergestat`
 * @version `0.6.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install mergestat.com/mergestat-lite`
 * @homepage https://mergestat.com/
 * @buildDependencies `go.dev@^1.19`, `cmake.org`, `libgit2.org@~1.7`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.mergestatcommergestatlite
 * console.log(pkg.name)        // "mergestat"
 * console.log(pkg.description) // "Query git repositories with SQL. Generate repor..."
 * console.log(pkg.programs)    // ["mergestat"]
 * console.log(pkg.versions[0]) // "0.6.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/mergestat-com/mergestat-lite.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install mergestat.com/mergestat-lite' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mergestat.com/mergestat-lite -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install mergestat.com/mergestat-lite' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.11',
    '0.5.10',
    '0.5.9',
    '0.5.8',
    '0.5.7',
    '0.5.6',
    '0.5.5',
    '0.5.4',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.9',
    '0.4.8',
    '0.4.7',
    '0.4.6',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.7',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.1',
    '0.2.0',
    '0.1.0',
    '0.0.1',
  ] as const,
  aliases: [] as const,
}

export type MergestatcommergestatlitePackage = typeof mergestatcommergestatlitePackage
