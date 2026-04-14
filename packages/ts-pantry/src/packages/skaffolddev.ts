/**
 * **skaffold** - Easy and Repeatable Kubernetes Development
 *
 * @domain `skaffold.dev`
 * @programs `skaffold`
 * @version `2.18.1` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install skaffold.dev`
 * @homepage https://skaffold.dev/
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.skaffolddev
 * console.log(pkg.name)        // "skaffold"
 * console.log(pkg.description) // "Easy and Repeatable Kubernetes Development"
 * console.log(pkg.programs)    // ["skaffold"]
 * console.log(pkg.versions[0]) // "2.18.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/skaffold-dev.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install skaffold.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +skaffold.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install skaffold.dev' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.18.3',
    '2.18.2',
    '2.18.1',
    '2.18.0',
    '2.17.3',
    '2.17.2',
    '2.17.1',
    '2.17.0',
    '2.16.1',
    '2.16.0',
    '2.15.0',
    '2.14.2',
    '2.14.1',
    '2.14.0',
    '2.13.2',
    '2.13.1',
    '2.13.0',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.1',
    '2.10.0',
    '2.9.0',
    '2.8.0',
    '2.7.1',
    '2.7.0',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.1',
    '2.3.8',
    '2.3.7',
    '2.3.6',
    '2.3.5',
    '2.3.4',
    '2.0.18',
    '2.0.17',
    '2.0.16',
    '2.0.15',
    '2.0.14',
    '2.0.13',
    '1.39.18',
    '1.39.17',
    '1.39.16',
    '1.39.15',
    '1.39.14',
    '1.39.13',
    '1.39.11',
  ] as const,
  aliases: [] as const,
}

export type SkaffolddevPackage = typeof skaffolddevPackage
