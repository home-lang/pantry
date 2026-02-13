/**
 * **vals** - Helm-like configuration values loader with support for various sources
 *
 * @domain `github.com/helmfile/vals`
 * @programs `vals`
 * @version `0.43.1` (42 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/helmfile/vals`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomhelmfilevals
 * console.log(pkg.name)        // "vals"
 * console.log(pkg.description) // "Helm-like configuration values loader with supp..."
 * console.log(pkg.programs)    // ["vals"]
 * console.log(pkg.versions[0]) // "0.43.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/helmfile/vals.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const valsPackage = {
  /**
   * The display name of this package.
   */
  name: 'vals' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/helmfile/vals' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Helm-like configuration values loader with support for various sources' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/helmfile/vals/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/helmfile/vals' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/helmfile/vals' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/helmfile/vals -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/helmfile/vals' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'vals',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.43.1',
    '0.43.0',
    '0.42.6',
    '0.42.5',
    '0.42.4',
    '0.42.3',
    '0.42.2',
    '0.42.1',
    '0.42.0',
    '0.41.3',
    '0.41.2',
    '0.41.1',
    '0.41.0',
    '0.40.1',
    '0.40.0',
    '0.39.4',
    '0.39.3',
    '0.39.2',
    '0.39.1',
    '0.39.0',
    '0.38.0',
    '0.37.8',
    '0.37.7',
    '0.37.6',
    '0.37.5',
    '0.37.4',
    '0.37.3',
    '0.37.2',
    '0.37.1',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.1',
    '0.34.0',
    '0.33.1',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.0',
    '0.28.1',
    '0.28.0',
  ] as const,
  aliases: [] as const,
}

export type ValsPackage = typeof valsPackage
