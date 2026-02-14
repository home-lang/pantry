/**
 * **create-dmg** - A shell script to build fancy DMGs
 *
 * @domain `github.com/create-dmg/create-dmg`
 * @programs `create-dmg`
 * @version `1.2.3` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/create-dmg/create-dmg`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcreatedmgcreatedmg
 * console.log(pkg.name)        // "create-dmg"
 * console.log(pkg.description) // "A shell script to build fancy DMGs"
 * console.log(pkg.programs)    // ["create-dmg"]
 * console.log(pkg.versions[0]) // "1.2.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/create-dmg/create-dmg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const createdmgPackage = {
  /**
  * The display name of this package.
  */
  name: 'create-dmg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/create-dmg/create-dmg' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A shell script to build fancy DMGs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/create-dmg/create-dmg/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/create-dmg/create-dmg' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/create-dmg/create-dmg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/create-dmg/create-dmg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/create-dmg/create-dmg' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'create-dmg',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type CreatedmgPackage = typeof createdmgPackage
