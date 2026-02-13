/**
 * **grype** - A vulnerability scanner for container images and filesystems
 *
 * @domain `github.com/anchore/grype`
 * @programs `grype`
 * @version `0.105.0` (75 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/anchore/grype`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomanchoregrype
 * console.log(pkg.name)        // "grype"
 * console.log(pkg.description) // "A vulnerability scanner for container images an..."
 * console.log(pkg.programs)    // ["grype"]
 * console.log(pkg.versions[0]) // "0.105.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/anchore/grype.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const grypePackage = {
  /**
   * The display name of this package.
   */
  name: 'grype' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/anchore/grype' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A vulnerability scanner for container images and filesystems' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/anchore/grype/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/anchore/grype' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/anchore/grype' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/anchore/grype -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/anchore/grype' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'grype',
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
    '0.105.0',
    '0.104.4',
    '0.104.3',
    '0.104.2',
    '0.104.1',
    '0.104.0',
    '0.103.0',
    '0.102.0',
    '0.101.1',
    '0.101.0',
    '0.100.0',
    '0.99.1',
    '0.99.0',
    '0.98.0',
    '0.97.2',
    '0.97.1',
    '0.97.0',
    '0.96.1',
    '0.96.0',
    '0.95.0',
    '0.94.0',
    '0.93.0',
    '0.92.2',
    '0.92.1',
    '0.92.0',
    '0.91.2',
    '0.91.1',
    '0.91.0',
    '0.90.0',
    '0.89.1',
    '0.89.0',
    '0.88.0',
    '0.87.0',
    '0.86.1',
    '0.86.0',
    '0.85.0',
    '0.84.0',
    '0.83.0',
    '0.82.2',
    '0.82.1',
    '0.82.0',
    '0.81.0',
    '0.80.2',
    '0.80.1',
    '0.80.0',
    '0.79.6',
    '0.79.5',
    '0.79.4',
    '0.79.3',
    '0.79.2',
    '0.79.1',
    '0.79.0',
    '0.78.0',
    '0.77.4',
    '0.77.3',
    '0.77.2',
    '0.77.1',
    '0.77.0',
    '0.76.0',
    '0.75.0',
    '0.74.7',
    '0.74.6',
    '0.74.5',
    '0.74.4',
    '0.74.3',
    '0.74.2',
    '0.74.1',
    '0.74.0',
    '0.73.5',
    '0.73.4',
    '0.73.3',
    '0.73.2',
    '0.73.1',
    '0.73.0',
    '0.72.0',
  ] as const,
  aliases: [] as const,
}

export type GrypePackage = typeof grypePackage
