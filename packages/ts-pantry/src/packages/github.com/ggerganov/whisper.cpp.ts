/**
 * **whisper** - Port of OpenAI's Whisper model in C/C++
 *
 * @domain `github.com/ggerganov/whisper.cpp`
 * @programs `whisper.cpp`, `whisper-cli`
 * @version `1.8.3` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ggerganov/whisper.cpp`
 * @dependencies `libsdl.org`, `linux:openmp.llvm.org^18 # as of 1.7.0`, `linux:gnu.org/gcc/libstdcxx@14` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/patch`, `gnu.org/coreutils`, `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomggerganovwhispercpp
 * console.log(pkg.name)        // "whisper"
 * console.log(pkg.description) // "Port of OpenAI's Whisper model in C/C++"
 * console.log(pkg.programs)    // ["whisper.cpp", "whisper-cli"]
 * console.log(pkg.versions[0]) // "1.8.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ggerganov/whisper-cpp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const whispercppPackage = {
  /**
   * The display name of this package.
   */
  name: 'whisper' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/ggerganov/whisper.cpp' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Port of OpenAI\'s Whisper model in C/C++' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ggerganov/whisper.cpp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ggerganov/whisper.cpp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/ggerganov/whisper.cpp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ggerganov/whisper.cpp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ggerganov/whisper.cpp' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'whisper.cpp',
    'whisper-cli',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'libsdl.org',
    'linux:openmp.llvm.org^18 # as of 1.7.0',
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/patch',
    'gnu.org/coreutils',
    'cmake.org@3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.2',
    '1.6.1',
    '1.6.0',
    '1.5.5',
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.3',
    '1.4.0',
  ] as const,
  aliases: [] as const,
}

export type WhispercppPackage = typeof whispercppPackage
