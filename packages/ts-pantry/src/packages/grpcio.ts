/**
 * **grpc** - The C based gRPC (C++, Python, Ruby, Objective-C, PHP, C#)
 *
 * @domain `grpc.io`
 * @programs `grpc_csharp_plugin`, `grpc_node_plugin`, `grpc_cpp_plugin`, `grpc_python_plugin`, `grpc_objective_c_plugin`, ... (+3 more)
 * @version `1.76.0` (53 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install grpc.io`
 * @homepage https://grpc.io/
 * @dependencies `abseil.io^20250127`, `c-ares.org`, `openssl.org^1.1`, ... (+4 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.grpcio
 * console.log(pkg.name)        // "grpc"
 * console.log(pkg.description) // "The C based gRPC (C++, Python, Ruby, Objective-..."
 * console.log(pkg.programs)    // ["grpc_csharp_plugin", "grpc_node_plugin", ...]
 * console.log(pkg.versions[0]) // "1.76.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/grpc-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const grpcioPackage = {
  /**
   * The display name of this package.
   */
  name: 'grpc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'grpc.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The C based gRPC (C++, Python, Ruby, Objective-C, PHP, C#)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/grpc.io/package.yml' as const,
  homepageUrl: 'https://grpc.io/' as const,
  githubUrl: 'https://github.com/grpc/grpc' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install grpc.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +grpc.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install grpc.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'grpc_csharp_plugin',
    'grpc_node_plugin',
    'grpc_cpp_plugin',
    'grpc_python_plugin',
    'grpc_objective_c_plugin',
    'grpc_ruby_plugin',
    'grpc_php_plugin',
    'grpc_cli',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'abseil.io^20250127',
    'c-ares.org',
    'openssl.org^1.1',
    'github.com/google/re2',
    'zlib.net',
    'linux:gnu.org/gcc/libstdcxx',
    'linux:protobuf.dev^30.0.0 # as of 1.72.0',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'darwin:gnu.org/patch',
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.76.0',
    '1.75.1',
    '1.75.0',
    '1.74.1',
    '1.74.0',
    '1.73.1',
    '1.73.0',
    '1.72.2',
    '1.72.1',
    '1.72.0',
    '1.71.2',
    '1.71.1',
    '1.71.0',
    '1.70.2',
    '1.70.1',
    '1.70.0',
    '1.69.0',
    '1.68.2',
    '1.68.1',
    '1.68.0',
    '1.67.1',
    '1.67.0',
    '1.66.2',
    '1.65.5',
    '1.65.4',
    '1.65.3',
    '1.65.2',
    '1.65.1',
    '1.65.0',
    '1.64.2',
    '1.64.1',
    '1.64.0',
    '1.63.1',
    '1.62.2',
    '1.62.1',
    '1.62.0',
    '1.61.2',
    '1.61.1',
    '1.61.0',
    '1.60.1',
    '1.60.0',
    '1.59.4',
    '1.59.3',
    '1.59.2',
    '1.59.1',
    '1.59.0',
    '1.58.2',
    '1.58.1',
    '1.58.0',
    '1.57.1',
    '1.56.4',
    '1.56.3',
    '1.55.4',
  ] as const,
  aliases: [] as const,
}

export type GrpcioPackage = typeof grpcioPackage
