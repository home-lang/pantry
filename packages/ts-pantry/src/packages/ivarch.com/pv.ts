/**
 * **pv** - Monitor data's progress through a pipe
 *
 * @domain `ivarch.com/pv`
 * @programs `pv`
 * @version `1.10.3` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ivarch.com/pv`
 * @homepage https://www.ivarch.com/programs/pv.shtml
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ivarchcompv
 * console.log(pkg.name)        // "pv"
 * console.log(pkg.description) // "Monitor data's progress through a pipe"
 * console.log(pkg.programs)    // ["pv"]
 * console.log(pkg.versions[0]) // "1.10.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ivarch-com/pv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ivarchcompvPackage = {
  /**
  * The display name of this package.
  */
  name: 'pv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ivarch.com/pv' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Monitor data\'s progress through a pipe' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ivarch.com/pv/package.yml' as const,
  homepageUrl: 'https://www.ivarch.com/programs/pv.shtml' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ivarch.com/pv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ivarch.com/pv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ivarch.com/pv' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.44',
    '1.9.42',
    '1.9.34',
    '1.9.31',
    '1.9.27',
    '1.9.25',
    '1.9.24',
    '1.9.15',
    '1.9.7',
    '1.9.0',
    '1.8.14',
    '1.8.13',
    '1.8.12',
    '1.8.10',
    '1.8.9',
    '1.8.5',
  ] as const,
  aliases: [] as const,
}

export type IvarchcompvPackage = typeof ivarchcompvPackage
