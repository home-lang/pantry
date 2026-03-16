/**
 * **mozjpeg** - Improved JPEG encoder.
 *
 * @domain `mozilla.org/mozjpeg`
 * @programs `cjpeg`, `djpeg`, `jpegtran`, `rdjpgcom`, `tjbench`, ... (+1 more)
 * @version `4.0.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install mozilla.org/mozjpeg`
 * @dependencies `libpng.org^1`
 * @buildDependencies `cmake.org@^3`, `nasm.us@^2`, `libpng.org@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.mozillaorgmozjpeg
 * console.log(pkg.name)        // "mozjpeg"
 * console.log(pkg.description) // "Improved JPEG encoder."
 * console.log(pkg.programs)    // ["cjpeg", "djpeg", ...]
 * console.log(pkg.versions[0]) // "4.0.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/mozilla-org/mozjpeg.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const mozillaorgmozjpegPackage = {
  /**
  * The display name of this package.
  */
  name: 'mozjpeg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mozilla.org/mozjpeg' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Improved JPEG encoder.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/mozjpeg/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mozilla/mozjpeg' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install mozilla.org/mozjpeg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mozilla.org/mozjpeg -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install mozilla.org/mozjpeg' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cjpeg',
    'djpeg',
    'jpegtran',
    'rdjpgcom',
    'tjbench',
    'wrjpgcom',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libpng.org^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
    'nasm.us@^2',
    'libpng.org@^1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.0.3',
  ] as const,
  aliases: [] as const,
}

export type MozillaorgmozjpegPackage = typeof mozillaorgmozjpegPackage
