/**
 * **pinniped** - Pinniped is the easy, secure way to log in to your Kubernetes clusters.
 *
 * @domain `pinniped.dev`
 * @programs `pinniped`
 * @version `0.43.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pinniped.dev`
 * @homepage https://pinniped.dev
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pinnipeddev
 * console.log(pkg.name)        // "pinniped"
 * console.log(pkg.description) // "Pinniped is the easy, secure way to log in to y..."
 * console.log(pkg.programs)    // ["pinniped"]
 * console.log(pkg.versions[0]) // "0.43.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pinniped-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pinnipeddevPackage = {
  /**
   * The display name of this package.
   */
  name: 'pinniped' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pinniped.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Pinniped is the easy, secure way to log in to your Kubernetes clusters.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pinniped.dev/package.yml' as const,
  homepageUrl: 'https://pinniped.dev' as const,
  githubUrl: 'https://github.com/vmware-tanzu/pinniped' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pinniped.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pinniped.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pinniped.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pinniped',
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
    '0.43.0',
    '0.42.0',
    '0.41.0',
    '0.40.0',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.0',
    '0.28.0',
    '0.27.0',
    '0.26.0',
  ] as const,
  aliases: [] as const,
}

export type PinnipeddevPackage = typeof pinnipeddevPackage
