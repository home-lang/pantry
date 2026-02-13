/**
 * **buildkit** - concurrent, cache-efficient, and Dockerfile-agnostic builder toolkit
 *
 * @domain `github.com/moby/buildkit`
 * @programs `buildctl`
 * @version `0.27.0` (37 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/moby/buildkit`
 * @homepage https://github.com/moby/moby/issues/34227
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommobybuildkit
 * console.log(pkg.name)        // "buildkit"
 * console.log(pkg.description) // "concurrent, cache-efficient, and Dockerfile-agn..."
 * console.log(pkg.programs)    // ["buildctl"]
 * console.log(pkg.versions[0]) // "0.27.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/moby/buildkit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const buildkitPackage = {
  /**
   * The display name of this package.
   */
  name: 'buildkit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/moby/buildkit' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'concurrent, cache-efficient, and Dockerfile-agnostic builder toolkit' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/moby/buildkit/package.yml' as const,
  homepageUrl: 'https://github.com/moby/moby/issues/34227' as const,
  githubUrl: 'https://github.com/moby/buildkit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/moby/buildkit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/moby/buildkit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/moby/buildkit' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'buildctl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.27.0',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.0',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.0',
    '0.21.1',
    '0.21.0',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.0',
    '0.18.2',
    '0.18.1',
    '0.18.0',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.0',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.1',
    '0.14.0',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.5',
    '0.12.4',
  ] as const,
  aliases: [] as const,
}

export type BuildkitPackage = typeof buildkitPackage
