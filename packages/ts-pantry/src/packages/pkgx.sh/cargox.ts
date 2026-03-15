/**
 * **cargox** - pkgx package
 *
 * @domain `pkgx.sh/cargox`
 * @programs `cargox`
 * @version `0.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pkgx.sh/cargox`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pkgxshcargox
 * console.log(pkg.name)        // "cargox"
 * console.log(pkg.programs)    // ["cargox"]
 * console.log(pkg.versions[0]) // "0.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pkgx-sh/cargox.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pkgxshcargoxPackage = {
  /**
  * The display name of this package.
  */
  name: 'cargox' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pkgx.sh/cargox' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/cargox/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pkgx.sh/cargox' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pkgx.sh/cargox -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install pkgx.sh/cargox' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cargox',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type PkgxshcargoxPackage = typeof pkgxshcargoxPackage
