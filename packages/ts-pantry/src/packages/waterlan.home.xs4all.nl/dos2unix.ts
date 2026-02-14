/**
 * **dos2unix** - Convert text between DOS, UNIX, and Mac formats
 *
 * @domain `waterlan.home.xs4all.nl/dos2unix`
 * @programs `dos2unix`, `mac2unix`, `unix2dos`, `unix2mac`
 * @version `7.5.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install waterlan.home.xs4all.nl/dos2unix`
 * @homepage https://waterlan.home.xs4all.nl/dos2unix.html
 * @dependencies `gnu.org/gettext`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.waterlanhomexs4allnldos2unix
 * console.log(pkg.name)        // "dos2unix"
 * console.log(pkg.description) // "Convert text between DOS, UNIX, and Mac formats"
 * console.log(pkg.programs)    // ["dos2unix", "mac2unix", ...]
 * console.log(pkg.versions[0]) // "7.5.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/waterlan-home-xs4all-nl/dos2unix.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const waterlanhomexs4allnldos2unixPackage = {
  /**
  * The display name of this package.
  */
  name: 'dos2unix' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'waterlan.home.xs4all.nl/dos2unix' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Convert text between DOS, UNIX, and Mac formats' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/waterlan.home.xs4all.nl/dos2unix/package.yml' as const,
  homepageUrl: 'https://waterlan.home.xs4all.nl/dos2unix.html' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install waterlan.home.xs4all.nl/dos2unix' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +waterlan.home.xs4all.nl/dos2unix -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install waterlan.home.xs4all.nl/dos2unix' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dos2unix',
    'mac2unix',
    'unix2dos',
    'unix2mac',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/gettext',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.5.4',
    '7.5.3',
    '7.5.2',
  ] as const,
  aliases: [] as const,
}

export type Waterlanhomexs4allnldos2unixPackage = typeof waterlanhomexs4allnldos2unixPackage
