/**
 * **zotregistry** - pkgx package
 *
 * @domain `zotregistry.dev`
 * @version `2.1.14` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install zotregistry.dev`
 * @buildDependencies `npmjs.com`, `go.dev@^1.25` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.zotregistrydev
 * console.log(pkg.name)        // "zotregistry"
 * console.log(pkg.versions[0]) // "2.1.14" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/zotregistry-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zotregistrydevPackage = {
  /**
  * The display name of this package.
  */
  name: 'zotregistry' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'zotregistry.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/zotregistry.dev/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/project-zot/zot' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install zotregistry.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +zotregistry.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install zotregistry.dev' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com',
    'go.dev@^1.25',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.14',
    '2.1.13',
  ] as const,
  aliases: [] as const,
}

export type ZotregistrydevPackage = typeof zotregistrydevPackage
