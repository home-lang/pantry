/**
 * **bazel** - A user-friendly launcher for Bazel.
 *
 * @domain `github.com/bazelbuild/bazelisk`
 * @programs `bazel`, `bazelisk`
 * @version `1.28.1` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/bazelbuild/bazelisk`
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcombazelbuildbazelisk
 * console.log(pkg.name)        // "bazel"
 * console.log(pkg.description) // "A user-friendly launcher for Bazel."
 * console.log(pkg.programs)    // ["bazel", "bazelisk"]
 * console.log(pkg.versions[0]) // "1.28.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/bazelbuild/bazelisk.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bazeliskPackage = {
  /**
   * The display name of this package.
   */
  name: 'bazel' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/bazelbuild/bazelisk' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A user-friendly launcher for Bazel.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bazelbuild/bazelisk/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/bazelbuild/bazelisk' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/bazelbuild/bazelisk' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/bazelbuild/bazelisk -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/bazelbuild/bazelisk' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bazel',
    'bazelisk',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
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
    '1.28.1',
    '1.28.0',
    '1.27.0',
    '1.26.0',
    '1.25.0',
    '1.24.1',
    '1.24.0',
    '1.23.0',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.0',
  ] as const,
  aliases: [] as const,
}

export type BazeliskPackage = typeof bazeliskPackage
