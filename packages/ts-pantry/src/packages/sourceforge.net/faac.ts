/**
 * **faac** - Freeware Advanced Audio Coder faac mirror
 *
 * @domain `sourceforge.net/faac`
 * @programs `faac`
 * @version `1.30.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sourceforge.net/faac`
 * @homepage https://sourceforge.net/projects/faac/
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sourceforgenetfaac
 * console.log(pkg.name)        // "faac"
 * console.log(pkg.description) // "Freeware Advanced Audio Coder faac mirror"
 * console.log(pkg.programs)    // ["faac"]
 * console.log(pkg.versions[0]) // "1.30.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sourceforge-net/faac.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourceforgenetfaacPackage = {
  /**
  * The display name of this package.
  */
  name: 'faac' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sourceforge.net/faac' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Freeware Advanced Audio Coder faac mirror' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/faac/package.yml' as const,
  homepageUrl: 'https://sourceforge.net/projects/faac/' as const,
  githubUrl: 'https://github.com/knik0/faac' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sourceforge.net/faac' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceforge.net/faac -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sourceforge.net/faac' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'faac',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.30.0',
  ] as const,
  aliases: [] as const,
}

export type SourceforgenetfaacPackage = typeof sourceforgenetfaacPackage
