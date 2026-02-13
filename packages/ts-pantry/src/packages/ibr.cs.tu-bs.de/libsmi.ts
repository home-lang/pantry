/**
 * **smi** - Library to Access SMI MIB Information
 *
 * @domain `ibr.cs.tu-bs.de/libsmi`
 * @programs `smidiff`, `smidump`, `smilint`, `smiquery`, `smixlate`
 * @version `0.4.8` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ibr.cs.tu-bs.de/libsmi`
 * @homepage https://www.ibr.cs.tu-bs.de/projects/libsmi/
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ibrcstubsdelibsmi
 * console.log(pkg.name)        // "smi"
 * console.log(pkg.description) // "Library to Access SMI MIB Information"
 * console.log(pkg.programs)    // ["smidiff", "smidump", ...]
 * console.log(pkg.versions[0]) // "0.4.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ibr-cs-tu-bs-de/libsmi.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ibrcstubsdelibsmiPackage = {
  /**
   * The display name of this package.
   */
  name: 'smi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ibr.cs.tu-bs.de/libsmi' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library to Access SMI MIB Information' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ibr.cs.tu-bs.de/libsmi/package.yml' as const,
  homepageUrl: 'https://www.ibr.cs.tu-bs.de/projects/libsmi/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ibr.cs.tu-bs.de/libsmi' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ibr.cs.tu-bs.de/libsmi -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ibr.cs.tu-bs.de/libsmi' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'smidiff',
    'smidump',
    'smilint',
    'smiquery',
    'smixlate',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.8',
  ] as const,
  aliases: [] as const,
}

export type IbrcstubsdelibsmiPackage = typeof ibrcstubsdelibsmiPackage
