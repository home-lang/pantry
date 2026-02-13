/**
 * **protoc-gen-jsonschema** - Protobuf to JSON-Schema compiler
 *
 * @domain `github.com/chrusty/protoc-gen-jsonschema`
 * @programs `protoc-gen-jsonschema`
 * @version `1.4.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/chrusty/protoc-gen-jsonschema`
 * @dependencies `protobuf.dev`
 * @buildDependencies `go.dev@^1.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomchrustyprotocgenjsonschema
 * console.log(pkg.name)        // "protoc-gen-jsonschema"
 * console.log(pkg.description) // "Protobuf to JSON-Schema compiler"
 * console.log(pkg.programs)    // ["protoc-gen-jsonschema"]
 * console.log(pkg.versions[0]) // "1.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/chrusty/protoc-gen-jsonschema.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const protocgenjsonschemaPackage = {
  /**
   * The display name of this package.
   */
  name: 'protoc-gen-jsonschema' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/chrusty/protoc-gen-jsonschema' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Protobuf to JSON-Schema compiler' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/chrusty/protoc-gen-jsonschema/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/chrusty/protoc-gen-jsonschema' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/chrusty/protoc-gen-jsonschema' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/chrusty/protoc-gen-jsonschema -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/chrusty/protoc-gen-jsonschema' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'protoc-gen-jsonschema',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'protobuf.dev',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.1',
  ] as const,
  aliases: [] as const,
}

export type ProtocgenjsonschemaPackage = typeof protocgenjsonschemaPackage
