/**
 * **nspr-config** - Platform-neutral API for system-level and libc-like functions
 *
 * @domain `mozilla.org/nspr`
 * @programs `nspr-config`
 * @version `4.38.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mozilla.org/nspr`
 * @homepage https://hg.mozilla.org/projects/nspr
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mozillaorgnspr
 * console.log(pkg.name)        // "nspr-config"
 * console.log(pkg.description) // "Platform-neutral API for system-level and libc-..."
 * console.log(pkg.programs)    // ["nspr-config"]
 * console.log(pkg.versions[0]) // "4.38.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mozilla-org/nspr.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mozillaorgnsprPackage = {
  /**
  * The display name of this package.
  */
  name: 'nspr-config' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mozilla.org/nspr' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Platform-neutral API for system-level and libc-like functions' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/nspr/package.yml' as const,
  homepageUrl: 'https://hg.mozilla.org/projects/nspr' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mozilla.org/nspr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mozilla.org/nspr -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mozilla.org/nspr' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'nspr-config',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.38.1',
    '4.36.2',
    '4.36.1',
    '4.34.1',
  ] as const,
  aliases: [] as const,
}

export type MozillaorgnsprPackage = typeof mozillaorgnsprPackage
