/**
 * **flac** - Free Lossless Audio Codec
 *
 * @domain `xiph.org/flac`
 * @programs `flac`
 * @version `1.5.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xiph.org/flac`
 * @homepage https://xiph.org/flac/
 * @dependencies `xiph.org/ogg^1.3.5`
 * @buildDependencies `gnu.org/libtool@^2.4`, `gnu.org/automake@^1.16`, `gnu.org/autoconf@^2.71` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xiphorgflac
 * console.log(pkg.name)        // "flac"
 * console.log(pkg.description) // "Free Lossless Audio Codec"
 * console.log(pkg.programs)    // ["flac"]
 * console.log(pkg.versions[0]) // "1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xiph-org/flac.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xiphorgflacPackage = {
  /**
  * The display name of this package.
  */
  name: 'flac' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'xiph.org/flac' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Free Lossless Audio Codec' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/flac/package.yml' as const,
  homepageUrl: 'https://xiph.org/flac/' as const,
  githubUrl: 'https://github.com/xiph/flac' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install xiph.org/flac' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xiph.org/flac -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xiph.org/flac' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'flac',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'xiph.org/ogg^1.3.5',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/libtool@^2.4',
    'gnu.org/automake@^1.16',
    'gnu.org/autoconf@^2.71',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.5.0',
    '1.4.3',
    '1.4.2',
  ] as const,
  aliases: [] as const,
}

export type XiphorgflacPackage = typeof xiphorgflacPackage
