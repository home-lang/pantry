/**
 * **spdlog** - Fast C++ logging library.
 *
 * @domain `github.com/gabime/spdlog`
 * @version `1.17.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/gabime/spdlog`
 * @dependencies `fmt.dev^11`
 * @buildDependencies `cmake.org@^3`, `darwin:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgabimespdlog
 * console.log(pkg.name)        // "spdlog"
 * console.log(pkg.description) // "Fast C++ logging library."
 * console.log(pkg.versions[0]) // "1.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/gabime/spdlog.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const spdlogPackage = {
  /**
   * The display name of this package.
   */
  name: 'spdlog' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/gabime/spdlog' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fast C++ logging library.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/gabime/spdlog/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/gabime/spdlog' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/gabime/spdlog' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/gabime/spdlog -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/gabime/spdlog' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'fmt.dev^11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
    'darwin:llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.17.0',
    '1.16.0',
    '1.15.3',
    '1.15.2',
    '1.15.1',
    '1.15.0',
    '1.14.1',
    '1.14.0',
    '1.13.0',
    '1.12.0',
  ] as const,
  aliases: [] as const,
}

export type SpdlogPackage = typeof spdlogPackage
