/**
 * **convco** - Conventional commits, changelog, versioning, validation
 *
 * @domain `convco.github.io`
 * @programs `convco`
 * @version `0.6.2` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install convco.github.io`
 * @homepage https://convco.github.io
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.convcogithubio
 * console.log(pkg.name)        // "convco"
 * console.log(pkg.description) // "Conventional commits, changelog, versioning, va..."
 * console.log(pkg.programs)    // ["convco"]
 * console.log(pkg.versions[0]) // "0.6.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/convco-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const convcogithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'convco' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'convco.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Conventional commits, changelog, versioning, validation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/convco.github.io/package.yml' as const,
  homepageUrl: 'https://convco.github.io' as const,
  githubUrl: 'https://github.com/convco/convco' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install convco.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +convco.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install convco.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'convco',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.3',
    '0.4.2',
    '0.4.1',
  ] as const,
  aliases: [] as const,
}

export type ConvcogithubioPackage = typeof convcogithubioPackage
