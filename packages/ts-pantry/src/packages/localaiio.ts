/**
 * **LocalAI** - :robot: The free, Open Source alternative to OpenAI, Claude and others. Self-hosted and local-first. Drop-in replacement for OpenAI,  running on consumer-grade hardware. No GPU required. Runs gguf, transformers, diffusers and many more models architectures. Features: Generate Text, Audio, Video, Images, Voice Cloning, Distributed, P2P inference
 *
 * @domain `localai.io`
 * @programs `local-ai`
 * @version `3.10.0` (55 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install localai.io`
 * @homepage https://localai.io
 * @dependencies `darwin:openmp.llvm.org@18` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `go.dev@^1.21`, `cmake.org@^3`, `grpc.io@=1.72.1`, ... (+5 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.localaiio
 * console.log(pkg.name)        // "LocalAI"
 * console.log(pkg.description) // ":robot: The free, Open Source alternative to Op..."
 * console.log(pkg.programs)    // ["local-ai"]
 * console.log(pkg.versions[0]) // "3.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/localai-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const localaiioPackage = {
  /**
   * The display name of this package.
   */
  name: 'LocalAI' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'localai.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: ':robot: The free, Open Source alternative to OpenAI, Claude and others. Self-hosted and local-first. Drop-in replacement for OpenAI,  running on consumer-grade hardware. No GPU required. Runs gguf, transformers, diffusers and many more models architectures. Features: Generate Text, Audio, Video, Images, Voice Cloning, Distributed, P2P inference' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/localai.io/package.yml' as const,
  homepageUrl: 'https://localai.io' as const,
  githubUrl: 'https://github.com/mudler/LocalAI' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install localai.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +localai.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install localai.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'local-ai',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'darwin:openmp.llvm.org@18',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@^1.21',
    'cmake.org@^3',
    'grpc.io@=1.72.1',
    'gnu.org/wget@^1',
    'gnu.org/coreutils@^9',
    'linux:gnu.org/gcc@14',
    'darwin:protobuf.dev@~28.1.0',
    'darwin:llvm.org@18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.10.0',
    '3.9.0',
    '3.8.0',
    '3.7.0',
    '3.6.0',
    '3.5.4',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.0',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '2.26.0',
    '2.25.0',
    '2.24.2',
    '2.24.1',
    '2.24.0',
    '2.23.0',
    '2.22.1',
    '2.22.0',
    '2.21.1',
    '2.21.0',
    '2.20.1',
    '2.20.0',
    '2.19.4',
    '2.19.3',
    '2.19.2',
    '2.19.1',
    '2.19.0',
    '2.18.1',
    '2.18.0',
    '2.17.1',
    '2.17.0',
    '2.15.0',
    '2.14.0',
    '2.13.0',
    '2.12.4',
    '2.12.3',
    '2.12.1',
    '2.12.0',
    '2.11.0',
    '2.10.1',
    '2.10.0',
    '2.9.0',
    '2.8.2',
    '2.8.1',
    '2.8.0',
    '2.7.0',
    '2.6.1',
  ] as const,
  aliases: [] as const,
}

export type LocalaiioPackage = typeof localaiioPackage
