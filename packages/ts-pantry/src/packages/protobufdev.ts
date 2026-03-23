/**
 * **Protocol Buffers** - Protocol Buffers - Google's data interchange format
 *
 * @domain `protobuf.dev`
 * @programs `protoc`
 * @version `34.1.0` (55 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install protobuf.dev`
 * @homepage https://protobuf.dev/
 * @dependencies `zlib.net^1`, `abseil.io`
 * @buildDependencies `cmake.org@^3`, `abseil.io@^20250127` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.protobufdev
 * console.log(pkg.name)        // "Protocol Buffers"
 * console.log(pkg.description) // "Protocol Buffers - Google's data interchange fo..."
 * console.log(pkg.programs)    // ["protoc"]
 * console.log(pkg.versions[0]) // "34.1.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/protobuf-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const protobufdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'Protocol Buffers' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'protobuf.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Protocol Buffers - Google\'s data interchange format' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/protobuf.dev/package.yml' as const,
  homepageUrl: 'https://protobuf.dev/' as const,
  githubUrl: 'https://github.com/protocolbuffers/protobuf' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install protobuf.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +protobuf.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install protobuf.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'protoc',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net^1',
    'abseil.io',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
    'abseil.io@^20250127',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '34.1',
    '34.1.0',
    '34.0',
    '34.0.0',
    '33.6',
    '33.6.0',
    '33.5',
    '33.5.0',
    '33.4',
    '33.4.0',
    '33.3',
    '33.3.0',
    '33.2',
    '33.2.0',
    '33.1',
    '33.1.0',
    '33.0',
    '33.0.0',
    '32.1',
    '32.1.0',
  ] as const,
  aliases: [] as const,
}

export type ProtobufdevPackage = typeof protobufdevPackage
