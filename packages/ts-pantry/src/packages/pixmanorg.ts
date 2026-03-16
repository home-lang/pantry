/**
 * **pixman** - pkgx package
 *
 * @domain `pixman.org`
 * @version `0.40.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pixman.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.pixmanorg
 * console.log(pkg.name)        // "pixman"
 * console.log(pkg.versions[0]) // "0.40.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/pixman-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const pixmanorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'pixman' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pixman.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pixman.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/freedesktop/pixman' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pixman.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pixman.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install pixman.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.40.0',
  ] as const,
  aliases: [] as const,
}

export type PixmanorgPackage = typeof pixmanorgPackage
