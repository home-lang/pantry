/**
 * **pciaccess** - pkgx package
 *
 * @domain `x.org/pciaccess`
 * @version `0.17.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/pciaccess`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgpciaccess
 * console.log(pkg.name)        // "pciaccess"
 * console.log(pkg.versions[0]) // "0.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/pciaccess.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgpciaccessPackage = {
  /**
  * The display name of this package.
  */
  name: 'pciaccess' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/pciaccess' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/pciaccess/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/pciaccess' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/pciaccess -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/pciaccess' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.17.0',
  ] as const,
  aliases: [] as const,
}

export type XorgpciaccessPackage = typeof xorgpciaccessPackage
