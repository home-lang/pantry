/**
 * **qrencode** - A fast and compact QR Code encoding library
 *
 * @domain `fukuchi.org/qrencode`
 * @programs `qrencode`
 * @version `4.1.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fukuchi.org/qrencode`
 * @homepage https://fukuchi.org/works/qrencode/index.html.en
 * @dependencies `libpng.org`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/coreutils`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fukuchiorgqrencode
 * console.log(pkg.name)        // "qrencode"
 * console.log(pkg.description) // "A fast and compact QR Code encoding library"
 * console.log(pkg.programs)    // ["qrencode"]
 * console.log(pkg.versions[0]) // "4.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fukuchi-org/qrencode.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fukuchiorgqrencodePackage = {
  /**
  * The display name of this package.
  */
  name: 'qrencode' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'fukuchi.org/qrencode' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A fast and compact QR Code encoding library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fukuchi.org/qrencode/package.yml' as const,
  homepageUrl: 'https://fukuchi.org/works/qrencode/index.html.en' as const,
  githubUrl: 'https://github.com/fukuchi/libqrencode' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install fukuchi.org/qrencode' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fukuchi.org/qrencode -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fukuchi.org/qrencode' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'qrencode',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libpng.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/coreutils',
    'gnu.org/libtool',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.1.1',
  ] as const,
  aliases: [] as const,
}

export type FukuchiorgqrencodePackage = typeof fukuchiorgqrencodePackage
