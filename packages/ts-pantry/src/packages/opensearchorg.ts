/**
 * **opensearch** - 🔎 Open source distributed and RESTful search engine.
 *
 * @domain `opensearch.org`
 * @programs `opensearch`, `opensearch-keystore`, `opensearch-plugin`, `opensearch-shard`
 * @version `3.5.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install opensearch.org`
 * @homepage https://opensearch.org/docs/latest/opensearch/index/
 * @dependencies `openjdk.org^21 # since v3`, `openmp.llvm.org^19`
 * @buildDependencies `cmake.org@3`, `gnu.org/wget`, `gnu.org/gcc@^11`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.opensearchorg
 * console.log(pkg.name)        // "opensearch"
 * console.log(pkg.description) // "🔎 Open source distributed and RESTful search e..."
 * console.log(pkg.programs)    // ["opensearch", "opensearch-keystore", ...]
 * console.log(pkg.versions[0]) // "3.5.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/opensearch-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const opensearchorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'opensearch' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'opensearch.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🔎 Open source distributed and RESTful search engine.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opensearch.org/package.yml' as const,
  homepageUrl: 'https://opensearch.org/docs/latest/opensearch/index/' as const,
  githubUrl: 'https://github.com/opensearch-project/OpenSearch' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install opensearch.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opensearch.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install opensearch.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'opensearch',
    'opensearch-keystore',
    'opensearch-plugin',
    'opensearch-shard',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openjdk.org^21 # since v3',
    'openmp.llvm.org^19',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org@3',
    'gnu.org/wget',
    'gnu.org/gcc@^11',
    'linux:netlib.org/lapack',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.6.0',
    '3.5.0',
    '3.4.0',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.0',
    '3.0.0-beta1',
    '3.0.0-alpha1',
    '2.19.4',
    '2.19.3',
    '2.19.2',
    '2.19.1',
    '2.18.0',
    '2.17.1',
    '2.17.0',
    '2.16.0',
    '2.15.0',
    '2.14.0',
    '2.13.0',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.0',
    '2.9.0',
    '2.8.0',
    '2.7.0',
    '2.6.0',
    '2.5.0',
    '2.4.1',
    '2.4.0',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.0',
    '2.0.1',
    '1.3.20',
    '1.3.18',
    '1.3.17',
    '1.3.16',
    '1.3.15',
    '1.3.13',
    '1.3.10',
    '1.3.9',
    '1.3.8',
    '1.3.7',
    '1.3.6',
    '1.3.5',
    '1.3.4',
  ] as const,
  aliases: [] as const,
}

export type OpensearchorgPackage = typeof opensearchorgPackage
