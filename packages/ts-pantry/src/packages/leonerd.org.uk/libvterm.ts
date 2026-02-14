/**
 * **libvterm** - C99 library which implements a VT220 or xterm terminal emulator
 *
 * @domain `leonerd.org.uk/libvterm`
 * @programs `unterm`, `vterm-ctrl`, `vterm-dump`
 * @version `0.3.3` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install leonerd.org.uk/libvterm`
 * @homepage https://www.leonerd.org.uk/code/libvterm/
 * @buildDependencies `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.leonerdorguklibvterm
 * console.log(pkg.name)        // "libvterm"
 * console.log(pkg.description) // "C99 library which implements a VT220 or xterm t..."
 * console.log(pkg.programs)    // ["unterm", "vterm-ctrl", ...]
 * console.log(pkg.versions[0]) // "0.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/leonerd-org-uk/libvterm.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const leonerdorguklibvtermPackage = {
  /**
  * The display name of this package.
  */
  name: 'libvterm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'leonerd.org.uk/libvterm' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'C99 library which implements a VT220 or xterm terminal emulator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/leonerd.org.uk/libvterm/package.yml' as const,
  homepageUrl: 'https://www.leonerd.org.uk/code/libvterm/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install leonerd.org.uk/libvterm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +leonerd.org.uk/libvterm -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install leonerd.org.uk/libvterm' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'unterm',
    'vterm-ctrl',
    'vterm-dump',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/libtool',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.3',
    '0.3.2',
    '0.3.1',
  ] as const,
  aliases: [] as const,
}

export type LeonerdorguklibvtermPackage = typeof leonerdorguklibvtermPackage
