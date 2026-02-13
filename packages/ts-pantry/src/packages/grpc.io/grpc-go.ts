/**
 * **protoc-gen-go-grpc** - The Go language implementation of gRPC. HTTP/2 based RPC
 *
 * @domain `grpc.io/grpc-go`
 * @programs `protoc-gen-go-grpc`
 * @version `1.78.0` (40 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install grpc.io/grpc-go`
 * @homepage https://grpc.io
 * @dependencies `google.com/protobuf-go^1`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.grpciogrpcgo
 * console.log(pkg.name)        // "protoc-gen-go-grpc"
 * console.log(pkg.description) // "The Go language implementation of gRPC. HTTP/2 ..."
 * console.log(pkg.programs)    // ["protoc-gen-go-grpc"]
 * console.log(pkg.versions[0]) // "1.78.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/grpc-io/grpc-go.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const grpciogrpcgoPackage = {
  /**
   * The display name of this package.
   */
  name: 'protoc-gen-go-grpc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'grpc.io/grpc-go' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Go language implementation of gRPC. HTTP/2 based RPC' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/grpc.io/grpc-go/package.yml' as const,
  homepageUrl: 'https://grpc.io' as const,
  githubUrl: 'https://github.com/grpc/grpc-go' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install grpc.io/grpc-go' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +grpc.io/grpc-go -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install grpc.io/grpc-go' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'protoc-gen-go-grpc',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'google.com/protobuf-go^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.78.0',
    '1.77.0',
    '1.76.0',
    '1.75.1',
    '1.75.0',
    '1.74.3',
    '1.74.2',
    '1.74.1',
    '1.74.0',
    '1.73.1',
    '1.73.0',
    '1.72.3',
    '1.72.2',
    '1.72.1',
    '1.72.0',
    '1.71.3',
    '1.71.2',
    '1.71.1',
    '1.71.0',
    '1.70.0',
    '1.69.4',
    '1.69.3',
    '1.69.2',
    '1.69.0',
    '1.68.2',
    '1.68.1',
    '1.68.0',
    '1.67.3',
    '1.67.2',
    '1.67.1',
    '1.67.0',
    '1.66.3',
    '1.66.2',
    '1.66.0',
    '1.65.1',
    '1.65.0',
    '1.64.1',
    '1.64.0',
    '1.63.3',
    '1.63.2',
  ] as const,
  aliases: [] as const,
}

export type GrpciogrpcgoPackage = typeof grpciogrpcgoPackage
