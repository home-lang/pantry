/**
 * **xft** - pkgx package
 *
 * @domain `x.org/xft`
 * @version `2.3.9` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xft`
 * @dependencies `freedesktop.org/fontconfig^2.14`, `x.org/xrender^0.9`, `sourceware.org/bzip2^1`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxft
 * console.log(pkg.name)        // "xft"
 * console.log(pkg.versions[0]) // "2.3.9" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xft.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxftPackage = {
  /**
  * The display name of this package.
  */
  name: 'xft' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xft' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xft/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/xft' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xft -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xft' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'freedesktop.org/fontconfig^2.14',
    'x.org/xrender^0.9',
    'sourceware.org/bzip2^1',
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.3.9',
    '2.3.8',
  ] as const,
  aliases: [] as const,
}

export type XorgxftPackage = typeof xorgxftPackage
