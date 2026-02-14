/**
 * **protoc-gen-go** - Go support for Google's protocol buffers
 *
 * @domain `google.com/protobuf-go`
 * @programs `protoc-gen-go`
 * @version `1.36.11` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/protobuf-go`
 * @homepage https://developers.google.com/protocol-buffers
 * @buildDependencies `go.dev@^1.17` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomprotobufgo
 * console.log(pkg.name)        // "protoc-gen-go"
 * console.log(pkg.description) // "Go support for Google's protocol buffers"
 * console.log(pkg.programs)    // ["protoc-gen-go"]
 * console.log(pkg.versions[0]) // "1.36.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/protobuf-go.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomprotobufgoPackage = {
  /**
  * The display name of this package.
  */
  name: 'protoc-gen-go' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'google.com/protobuf-go' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Go support for Google\'s protocol buffers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/protobuf-go/package.yml' as const,
  homepageUrl: 'https://developers.google.com/protocol-buffers' as const,
  githubUrl: 'https://github.com/protocolbuffers/protobuf-go' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install google.com/protobuf-go' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/protobuf-go -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/protobuf-go' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'protoc-gen-go',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.17',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.36.11',
    '1.36.10',
    '1.36.9',
    '1.36.8',
    '1.36.7',
    '1.36.6',
    '1.36.5',
    '1.36.4',
    '1.36.3',
    '1.36.2',
    '1.36.1',
    '1.36.0',
    '1.35.2',
    '1.35.1',
    '1.34.2',
    '1.34.1',
    '1.34.0',
    '1.33.0',
  ] as const,
  aliases: [] as const,
}

export type GooglecomprotobufgoPackage = typeof googlecomprotobufgoPackage
