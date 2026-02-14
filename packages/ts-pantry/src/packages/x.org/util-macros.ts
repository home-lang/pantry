/**
 * **util-macros** - pkgx package
 *
 * @domain `x.org/util-macros`
 * @version `1.20.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/util-macros`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgutilmacros
 * console.log(pkg.name)        // "util-macros"
 * console.log(pkg.versions[0]) // "1.20.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/util-macros.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgutilmacrosPackage = {
  /**
  * The display name of this package.
  */
  name: 'util-macros' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/util-macros' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/util-macros/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/util-macros' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/util-macros -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/util-macros' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.20.2',
    '1.20.1',
    '1.20.0',
  ] as const,
  aliases: [] as const,
}

export type XorgutilmacrosPackage = typeof xorgutilmacrosPackage
