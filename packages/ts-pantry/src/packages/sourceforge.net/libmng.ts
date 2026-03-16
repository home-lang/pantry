/**
 * **libmng** - pkgx package
 *
 * @domain `sourceforge.net/libmng`
 * @version `2.0.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sourceforge.net/libmng`
 * @dependencies `libjpeg-turbo.org`, `littlecms.com>=2.0.0`, `zlib.net`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sourceforgenetlibmng
 * console.log(pkg.name)        // "libmng"
 * console.log(pkg.versions[0]) // "2.0.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sourceforge-net/libmng.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sourceforgenetlibmngPackage = {
  /**
  * The display name of this package.
  */
  name: 'libmng' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sourceforge.net/libmng' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/libmng/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sourceforge.net/libmng' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceforge.net/libmng -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install sourceforge.net/libmng' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libjpeg-turbo.org',
    'littlecms.com>=2.0.0',
    'zlib.net',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.0.3',
  ] as const,
  aliases: [] as const,
}

export type SourceforgenetlibmngPackage = typeof sourceforgenetlibmngPackage
