/**
 * **v2** - pkgx package
 *
 * @domain `macfuse.github.io/v2`
 * @version `5.1.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install macfuse.github.io/v2`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.macfusegithubiov2
 * console.log(pkg.name)        // "v2"
 * console.log(pkg.versions[0]) // "5.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/macfuse-github-io/v2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const macfusegithubiov2Package = {
  /**
   * The display name of this package.
   */
  name: 'v2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'macfuse.github.io/v2' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/macfuse.github.io/v2/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/macfuse/macfuse' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install macfuse.github.io/v2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +macfuse.github.io/v2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install macfuse.github.io/v2' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'gnu.org/gettext',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.3',
  ] as const,
  aliases: [] as const,
}

export type Macfusegithubiov2Package = typeof macfusegithubiov2Package
