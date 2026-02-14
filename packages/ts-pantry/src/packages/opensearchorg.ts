/**
 * **opensearch** - 🔎 Open source distributed and RESTful search engine.
 *
 * @domain `opensearch.org`
 * @programs `opensearch`, `opensearch-keystore`, `opensearch-plugin`, `opensearch-shard`
 * @version `3.5.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install opensearch.org`
 * @homepage https://opensearch.org/docs/latest/opensearch/index/
 * @dependencies `openjdk.org^21 # since v3`, `openmp.llvm.org^19`
 * @buildDependencies `cmake.org@3`, `gnu.org/wget`, `gnu.org/gcc@^11`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opensearchorg
 * console.log(pkg.name)        // "opensearch"
 * console.log(pkg.description) // "🔎 Open source distributed and RESTful search e..."
 * console.log(pkg.programs)    // ["opensearch", "opensearch-keystore", ...]
 * console.log(pkg.versions[0]) // "3.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/opensearch-org.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install opensearch.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opensearch.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install opensearch.org' as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.5.0',
    '3.4.0',
    '3.2.0',
    '3.1.0',
    '3.0.0',
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
  ] as const,
  aliases: [] as const,
}

export type OpensearchorgPackage = typeof opensearchorgPackage
