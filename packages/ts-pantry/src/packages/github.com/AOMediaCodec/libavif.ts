/**
 * **avif** - libavif - Library for encoding and decoding .avif files
 *
 * @domain `github.com/AOMediaCodec/libavif`
 * @programs `avifenc`, `avifdec`
 * @version `1.3.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/AOMediaCodec/libavif`
 * @dependencies `aomedia.googlesource.com/aom^3`, `libpng.org^1`, `libjpeg-turbo.org^2`
 * @buildDependencies `cmake.org@^3`, `nasm.us` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomaomediacodeclibavif
 * console.log(pkg.name)        // "avif"
 * console.log(pkg.description) // "libavif - Library for encoding and decoding .av..."
 * console.log(pkg.programs)    // ["avifenc", "avifdec"]
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/AOMediaCodec/libavif.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libavifPackage = {
  /**
   * The display name of this package.
   */
  name: 'avif' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/AOMediaCodec/libavif' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'libavif - Library for encoding and decoding .avif files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AOMediaCodec/libavif/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/AOMediaCodec/libavif' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/AOMediaCodec/libavif' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/AOMediaCodec/libavif -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/AOMediaCodec/libavif' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'avifenc',
    'avifdec',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'aomedia.googlesource.com/aom^3',
    'libpng.org^1',
    'libjpeg-turbo.org^2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
    'nasm.us',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.11.1',
  ] as const,
  aliases: [] as const,
}

export type LibavifPackage = typeof libavifPackage
