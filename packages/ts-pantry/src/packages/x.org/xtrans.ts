/**
 * **xtrans** - pkgx package
 *
 * @domain `x.org/xtrans`
 * @version `1.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install x.org/xtrans`
 * @dependencies `x.org/protocol`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.xorgxtrans
 * console.log(pkg.name)        // "xtrans"
 * console.log(pkg.versions[0]) // "1.4.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/x-org/xtrans.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const xorgxtransPackage = {
  /**
  * The display name of this package.
  */
  name: 'xtrans' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xtrans' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xtrans/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install x.org/xtrans' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xtrans -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install x.org/xtrans' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/protocol',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.0',
  ] as const,
  aliases: [] as const,
}

export type XorgxtransPackage = typeof xorgxtransPackage
