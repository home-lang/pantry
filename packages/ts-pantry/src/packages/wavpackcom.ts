/**
 * **wavpack** - WavPack encode/decode library, command-line programs, and several plugins
 *
 * @domain `wavpack.com`
 * @programs `wavpack`, `wvunpack`, `wvtag`, `wvgain`
 * @version `5.9.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install wavpack.com`
 * @homepage https://www.wavpack.com/
 * @buildDependencies `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.wavpackcom
 * console.log(pkg.name)        // "wavpack"
 * console.log(pkg.description) // "WavPack encode/decode library, command-line pro..."
 * console.log(pkg.programs)    // ["wavpack", "wvunpack", ...]
 * console.log(pkg.versions[0]) // "5.9.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/wavpack-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const wavpackcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'wavpack' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'wavpack.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'WavPack encode/decode library, command-line programs, and several plugins' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wavpack.com/package.yml' as const,
  homepageUrl: 'https://www.wavpack.com/' as const,
  githubUrl: 'https://github.com/dbry/WavPack' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install wavpack.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wavpack.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install wavpack.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'wavpack',
    'wvunpack',
    'wvtag',
    'wvgain',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '5.9.0',
    '5.8.1',
    '5.8.0',
    '5.7.0',
    '5.6.0',
    '5.5.0',
    '5.4.0',
    '5.3.0',
    '5.2.0',
    '5.1.0',
    '5.0.0',
    '4.80.0',
  ] as const,
  aliases: [] as const,
}

export type WavpackcomPackage = typeof wavpackcomPackage
