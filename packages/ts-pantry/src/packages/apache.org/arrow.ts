/**
 * **arrow** - Apache Arrow is the universal columnar format and multi-language toolbox for fast data interchange and in-memory analytics
 *
 * @domain `apache.org/arrow`
 * @programs `parquet-dump-schema`, `parquet-reader`, `parquet-scan`
 * @version `23.0.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apache.org/arrow`
 * @homepage https://arrow.apache.org/
 * @dependencies `github.com/aws/aws-sdk-cpp`, `github.com/google/brotli`, `sourceware.org/bzip2`, ... (+14 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `boost.org`, `cmake.org@3`, `python.org@<3.12`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apacheorgarrow
 * console.log(pkg.name)        // "arrow"
 * console.log(pkg.description) // "Apache Arrow is the universal columnar format a..."
 * console.log(pkg.programs)    // ["parquet-dump-schema", "parquet-reader", ...]
 * console.log(pkg.versions[0]) // "23.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apache-org/arrow.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apacheorgarrowPackage = {
  /**
   * The display name of this package.
   */
  name: 'arrow' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apache.org/arrow' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Apache Arrow is the universal columnar format and multi-language toolbox for fast data interchange and in-memory analytics' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/arrow/package.yml' as const,
  homepageUrl: 'https://arrow.apache.org/' as const,
  githubUrl: 'https://github.com/apache/arrow' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apache.org/arrow' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/arrow -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apache.org/arrow' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'parquet-dump-schema',
    'parquet-reader',
    'parquet-scan',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'github.com/aws/aws-sdk-cpp',
    'github.com/google/brotli',
    'sourceware.org/bzip2',
    'google.com/glog',
    'grpc.io',
    'lz4.org',
    'openssl.org',
    'rapidjson.org',
    'github.com/google/re2',
    'google.github.io/snappy',
    'apache.org/thrift',
    'github.com/JuliaStrings/utf8proc',
    'facebook.com/zstd',
    'darwin:c-ares.org@1',
    'darwin:libcxx.llvm.org~17',
    'linux:protobuf.dev^30.0.0 # match grpc.io, so gdal.org can build, we bundle on darwin',
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'boost.org',
    'cmake.org@3',
    'python.org@<3.12',
    'llvm.org@~17',
    'linux:gnu.org/gcc@14',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '23.0.0',
    '22.0.0',
    '21.0.0',
    '20.0.0',
    '19.0.1',
    '19.0.0',
    '18.1.0',
    '18.0.0',
    '16.1.0',
    '16.0.0',
    '15.0.2',
    '15.0.1',
    '15.0.0',
    '14.0.2',
    '14.0.1',
    '14.0.0',
    '13.0.0',
  ] as const,
  aliases: [] as const,
}

export type ApacheorgarrowPackage = typeof apacheorgarrowPackage
