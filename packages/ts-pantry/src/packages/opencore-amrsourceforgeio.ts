/**
 * **opencore-amr.sourceforge** - pkgx package
 *
 * @domain `opencore-amr.sourceforge.io`
 * @version `0.1.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install opencore-amr.sourceforge.io`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opencoreamrsourceforgeio
 * console.log(pkg.name)        // "opencore-amr.sourceforge"
 * console.log(pkg.versions[0]) // "0.1.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/opencore-amr-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opencoreamrsourceforgeioPackage = {
  /**
  * The display name of this package.
  */
  name: 'opencore-amr.sourceforge' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'opencore-amr.sourceforge.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opencore-amr.sourceforge.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install opencore-amr.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opencore-amr.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install opencore-amr.sourceforge.io' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.6',
  ] as const,
  aliases: [] as const,
}

export type OpencoreamrsourceforgeioPackage = typeof opencoreamrsourceforgeioPackage
