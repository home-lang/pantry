/**
 * **protoc-gen-connect-go** - The Go implementation of Connect: Protobuf RPC that works.
 *
 * @domain `connectrpc.org/protoc-gen-connect-go`
 * @programs `protoc-gen-connect-go`
 * @version `1.19.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install connectrpc.org/protoc-gen-connect-go`
 * @homepage https://connectrpc.com
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.connectrpcorgprotocgenconnectgo
 * console.log(pkg.name)        // "protoc-gen-connect-go"
 * console.log(pkg.description) // "The Go implementation of Connect: Protobuf RPC ..."
 * console.log(pkg.programs)    // ["protoc-gen-connect-go"]
 * console.log(pkg.versions[0]) // "1.19.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/connectrpc-org/protoc-gen-connect-go.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const connectrpcorgprotocgenconnectgoPackage = {
  /**
  * The display name of this package.
  */
  name: 'protoc-gen-connect-go' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'connectrpc.org/protoc-gen-connect-go' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Go implementation of Connect: Protobuf RPC that works.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/connectrpc.org/protoc-gen-connect-go/package.yml' as const,
  homepageUrl: 'https://connectrpc.com' as const,
  githubUrl: 'https://github.com/connectrpc/connect-go' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install connectrpc.org/protoc-gen-connect-go' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +connectrpc.org/protoc-gen-connect-go -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install connectrpc.org/protoc-gen-connect-go' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'protoc-gen-connect-go',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.19.1',
    '1.19.0',
    '1.18.1',
    '1.18.0',
    '1.17.0',
    '1.16.2',
  ] as const,
  aliases: [] as const,
}

export type ConnectrpcorgprotocgenconnectgoPackage = typeof connectrpcorgprotocgenconnectgoPackage
