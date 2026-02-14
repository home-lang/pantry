/**
 * **optipng** - PNG file optimizer
 *
 * @domain `sf.net/optipng`
 * @programs `optipng`
 * @version `7.9.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sf.net/optipng`
 * @homepage https://optipng.sourceforge.net/
 * @dependencies `libpng.org^1`, `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sfnetoptipng
 * console.log(pkg.name)        // "optipng"
 * console.log(pkg.description) // "PNG file optimizer"
 * console.log(pkg.programs)    // ["optipng"]
 * console.log(pkg.versions[0]) // "7.9.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sf-net/optipng.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sfnetoptipngPackage = {
  /**
  * The display name of this package.
  */
  name: 'optipng' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sf.net/optipng' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'PNG file optimizer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sf.net/optipng/package.yml' as const,
  homepageUrl: 'https://optipng.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sf.net/optipng' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sf.net/optipng -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sf.net/optipng' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'optipng',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libpng.org^1',
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.9.1',
    '0.7.8',
    '0.7.7',
  ] as const,
  aliases: [] as const,
}

export type SfnetoptipngPackage = typeof sfnetoptipngPackage
