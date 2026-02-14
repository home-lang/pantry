/**
 * **xvid** - pkgx package
 *
 * @domain `xvid.com`
 * @version `1.3.7` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xvid.com`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xvidcom
 * console.log(pkg.name)        // "xvid"
 * console.log(pkg.versions[0]) // "1.3.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xvid-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xvidcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'xvid' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'xvid.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xvid.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install xvid.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xvid.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xvid.com' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.7',
  ] as const,
  aliases: [] as const,
}

export type XvidcomPackage = typeof xvidcomPackage
