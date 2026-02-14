/**
 * **libimagequant** - Palette quantization library that powers pngquant and other PNG optimizers
 *
 * @domain `pngquant.org/lib`
 * @version `4.4.1` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pngquant.org/lib`
 * @homepage https://pngquant.org/lib
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pngquantorglib
 * console.log(pkg.name)        // "libimagequant"
 * console.log(pkg.description) // "Palette quantization library that powers pngqua..."
 * console.log(pkg.versions[0]) // "4.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pngquant-org/lib.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pngquantorglibPackage = {
  /**
  * The display name of this package.
  */
  name: 'libimagequant' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pngquant.org/lib' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Palette quantization library that powers pngquant and other PNG optimizers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pngquant.org/lib/package.yml' as const,
  homepageUrl: 'https://pngquant.org/lib' as const,
  githubUrl: 'https://github.com/ImageOptim/libimagequant' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install pngquant.org/lib' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pngquant.org/lib -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pngquant.org/lib' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.4.1',
    '4.4.0',
    '4.3.4',
    '4.3.3',
    '4.3.2',
    '4.3.1',
    '4.3.0',
    '4.2.2',
    '4.2.1',
    '4.2.0',
  ] as const,
  aliases: [] as const,
}

export type PngquantorglibPackage = typeof pngquantorglibPackage
