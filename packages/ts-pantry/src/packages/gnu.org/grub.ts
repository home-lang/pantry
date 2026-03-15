/**
 * **grub** - pkgx package
 *
 * @domain `gnu.org/grub`
 *
 * @install `launchpad install gnu.org/grub`
 * @dependencies `gnu.org/gettext`, `sourceware.org/bzip2`, `tukaani.org/xz`, ... (+3 more)
 * @buildDependencies `gnu.org/bison`, `gnu.org/m4`, `github.com/westes/flex`, ... (+3 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggrub
 * console.log(pkg.name)        // "grub"
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/grub.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggrubPackage = {
  /**
  * The display name of this package.
  */
  name: 'grub' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/grub' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/grub/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/grub' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/grub -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/grub' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/gettext',
    'sourceware.org/bzip2',
    'tukaani.org/xz',
    'zlib.net',
    'gnupg.org/libgcrypt',
    'gnu.org/libunistring',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/bison',
    'gnu.org/m4',
    'github.com/westes/flex',
    'gnu.org/autoconf',
    'gnu.org/automake',
    'python.org@~3.11',
  ] as const,
  versions: [] as const,
  aliases: [] as const,
}

export type GnuorggrubPackage = typeof gnuorggrubPackage
