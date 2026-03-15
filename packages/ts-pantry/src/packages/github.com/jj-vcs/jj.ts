/**
 * **jj** - pkgx package
 *
 * @domain `github.com/jj-vcs/jj`
 * @programs `jj`
 * @version `0.39.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/jj-vcs/jj`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjjvcsjj
 * console.log(pkg.name)        // "jj"
 * console.log(pkg.programs)    // ["jj"]
 * console.log(pkg.versions[0]) // "0.39.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jj-vcs/jj.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jjPackage = {
  /**
  * The display name of this package.
  */
  name: 'jj' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/jj-vcs/jj' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jj-vcs/jj/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/jj-vcs/jj' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jj-vcs/jj -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/jj-vcs/jj' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'jj',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.39.0',
  ] as const,
  aliases: [] as const,
}

export type JjPackage = typeof jjPackage
