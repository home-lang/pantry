/**
 * **emacs** - GNU Emacs text editor
 *
 * @domain `gnu.org/emacs`
 * @programs `emacs`
 * @version `30.2.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/emacs`
 * @homepage https://www.gnu.org/software/emacs/
 * @dependencies `gnome.org/libxml2^2.10.3`, `invisible-island.net/ncurses^6.3.0`, `libjpeg-turbo.org^2.1.5.1`, ... (+5 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgemacs
 * console.log(pkg.name)        // "emacs"
 * console.log(pkg.description) // "GNU Emacs text editor"
 * console.log(pkg.programs)    // ["emacs"]
 * console.log(pkg.versions[0]) // "30.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/emacs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgemacsPackage = {
  /**
  * The display name of this package.
  */
  name: 'emacs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/emacs' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'GNU Emacs text editor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/emacs/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/emacs/' as const,
  githubUrl: 'https://github.com/emacs-mirror/emacs' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/emacs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/emacs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/emacs' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'emacs',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/libxml2^2.10.3',
    'invisible-island.net/ncurses^6.3.0',
    'libjpeg-turbo.org^2.1.5.1',
    'gnu.org/sed^4.9.0',
    'gnu.org/texinfo^7.0.1',
    'gnu.org/libidn2^2.3',
    'gnutls.org^3.6',
    'zlib.net^1.2',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '30.2.0',
    '30.1.0',
    '29.4.0',
    '29.3.0',
    '29.2.0',
    '29.1.0',
    '28.2.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgemacsPackage = typeof gnuorgemacsPackage
