/**
 * **Protocol Buffers** - Protocol Buffers - Google's data interchange format
 *
 * @domain `protobuf.dev`
 * @programs `protoc`
 * @version `33.4.0` (50 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install protobuf.dev`
 * @homepage https://protobuf.dev/
 * @dependencies `zlib.net^1`, `abseil.io`
 * @buildDependencies `cmake.org@^3`, `abseil.io@^20250127` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.protobufdev
 * console.log(pkg.name)        // "Protocol Buffers"
 * console.log(pkg.description) // "Protocol Buffers - Google's data interchange fo..."
 * console.log(pkg.programs)    // ["protoc"]
 * console.log(pkg.versions[0]) // "33.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/protobuf-dev.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install protobuf.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +protobuf.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install protobuf.dev' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '33.4.0',
    '33.3.0',
    '33.2.0',
    '33.1.0',
    '33.0.0',
    '32.1.0',
    '32.0.0',
    '31.1.0',
    '31.0.0',
    '30.2.0',
    '30.1.0',
    '30.0.0',
    '29.5.0',
    '29.4.0',
    '29.3.0',
    '29.2.0',
    '29.1.0',
    '29.0.0',
    '28.3.0',
    '28.2.0',
    '28.1.0',
    '28.0.0',
    '27.5.0',
    '27.4.0',
    '27.3.0',
    '27.2.0',
    '27.1.0',
    '27.0.0',
    '26.1.0',
    '26.0.0',
    '25.8.0',
    '25.7.0',
    '25.6.0',
    '25.5.0',
    '25.4.0',
    '25.3.0',
    '25.2.0',
    '25.1.0',
    '25.0.0',
    '24.4.0',
    '24.3.0',
    '24.2.0',
    '24.1.0',
    '23.4.0',
    '23.3.0',
    '23.2.0',
    '23.1.0',
    '23.0.0',
    '22.5.0',
    '21.12.0',
  ] as const,
  aliases: [] as const,
}

export type ProtobufdevPackage = typeof protobufdevPackage
