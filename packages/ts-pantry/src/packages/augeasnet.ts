/**
 * **augeas** - A configuration editing tool and API
 *
 * @domain `augeas.net`
 * @programs `augmatch`, `augparse`, `augprint`, `augtool`, `fadot`
 * @version `1.14.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install augeas.net`
 * @homepage https://augeas.net/
 * @dependencies `gnu.org/readline`, `gnome.org/libxml2`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/bison`, ... (+4 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.augeasnet
 * console.log(pkg.name)        // "augeas"
 * console.log(pkg.description) // "A configuration editing tool and API"
 * console.log(pkg.programs)    // ["augmatch", "augparse", ...]
 * console.log(pkg.versions[0]) // "1.14.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/augeas-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const augeasnetPackage = {
  /**
  * The display name of this package.
  */
  name: 'augeas' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'augeas.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A configuration editing tool and API' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/augeas.net/package.yml' as const,
  homepageUrl: 'https://augeas.net/' as const,
  githubUrl: 'https://github.com/hercules-team/augeas' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install augeas.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +augeas.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install augeas.net' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'augmatch',
    'augparse',
    'augprint',
    'augtool',
    'fadot',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/readline',
    'gnome.org/libxml2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/bison',
    'gnu.org/libtool',
    'curl.se',
    'gnu.org/patch',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.14.1',
    '1.14.0',
  ] as const,
  aliases: [] as const,
}

export type AugeasnetPackage = typeof augeasnetPackage
