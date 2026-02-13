/**
 * **skaffold** - Easy and Repeatable Kubernetes Development
 *
 * @domain `skaffold.dev`
 * @programs `skaffold`
 * @version `2.17.1` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install skaffold.dev`
 * @homepage https://skaffold.dev/
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.skaffolddev
 * console.log(pkg.name)        // "skaffold"
 * console.log(pkg.description) // "Easy and Repeatable Kubernetes Development"
 * console.log(pkg.programs)    // ["skaffold"]
 * console.log(pkg.versions[0]) // "2.17.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/skaffold-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const skaffolddevPackage = {
  /**
   * The display name of this package.
   */
  name: 'skaffold' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'skaffold.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Easy and Repeatable Kubernetes Development' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/skaffold.dev/package.yml' as const,
  homepageUrl: 'https://skaffold.dev/' as const,
  githubUrl: 'https://github.com/GoogleContainerTools/skaffold' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install skaffold.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +skaffold.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install skaffold.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'skaffold',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.17.1',
    '2.17.0',
    '2.16.1',
    '2.16.0',
    '2.15.0',
    '2.14.2',
    '2.14.1',
    '2.14.0',
    '2.13.2',
    '2.13.0',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.1',
    '2.10.0',
    '2.9.0',
    '2.8.0',
  ] as const,
  aliases: [] as const,
}

export type SkaffolddevPackage = typeof skaffolddevPackage
