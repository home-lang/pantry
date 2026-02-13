/**
 * **buildifier** - Format bazel BUILD files with a standard convention
 *
 * @domain `github.com/bazelbuild/buildtools`
 * @programs `buildifier`
 * @version `8.2.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/bazelbuild/buildtools`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcombazelbuildbuildtools
 * console.log(pkg.name)        // "buildifier"
 * console.log(pkg.description) // "Format bazel BUILD files with a standard conven..."
 * console.log(pkg.programs)    // ["buildifier"]
 * console.log(pkg.versions[0]) // "8.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/bazelbuild/buildtools.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const buildtoolsPackage = {
  /**
   * The display name of this package.
   */
  name: 'buildifier' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/bazelbuild/buildtools' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Format bazel BUILD files with a standard convention' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bazelbuild/buildtools/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/bazelbuild/buildtools' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/bazelbuild/buildtools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/bazelbuild/buildtools -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/bazelbuild/buildtools' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'buildifier',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
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
    '8.2.1',
    '8.2.0',
    '8.0.3',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.3.1',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '6.4.0',
  ] as const,
  aliases: [] as const,
}

export type BuildtoolsPackage = typeof buildtoolsPackage
