/**
 * **bcrypt** - Cross platform file encryption utility using blowfish
 *
 * @domain `bcrypt.sourceforge.net`
 * @programs `bcrypt`
 * @version `1.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install bcrypt.sourceforge.net`
 * @homepage https://bcrypt.sourceforge.net/
 * @dependencies `zlib.net`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.bcryptsourceforgenet
 * console.log(pkg.name)        // "bcrypt"
 * console.log(pkg.description) // "Cross platform file encryption utility using bl..."
 * console.log(pkg.programs)    // ["bcrypt"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/bcrypt-sourceforge-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bcryptsourceforgenetPackage = {
  /**
  * The display name of this package.
  */
  name: 'bcrypt' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'bcrypt.sourceforge.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Cross platform file encryption utility using blowfish' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bcrypt.sourceforge.net/package.yml' as const,
  homepageUrl: 'https://bcrypt.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install bcrypt.sourceforge.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bcrypt.sourceforge.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install bcrypt.sourceforge.net' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bcrypt',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type BcryptsourceforgenetPackage = typeof bcryptsourceforgenetPackage
