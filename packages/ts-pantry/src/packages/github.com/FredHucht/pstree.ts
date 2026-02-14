/**
 * **pstree** - pstree shows the process listing as a tree
 *
 * @domain `github.com/FredHucht/pstree`
 * @programs `pstree`
 * @version `2.40.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/FredHucht/pstree`
 * @buildDependencies `gnu.org/gcc` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomfredhuchtpstree
 * console.log(pkg.name)        // "pstree"
 * console.log(pkg.description) // "pstree shows the process listing as a tree"
 * console.log(pkg.programs)    // ["pstree"]
 * console.log(pkg.versions[0]) // "2.40.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/FredHucht/pstree.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pstreePackage = {
  /**
  * The display name of this package.
  */
  name: 'pstree' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/FredHucht/pstree' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'pstree shows the process listing as a tree' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/FredHucht/pstree/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/FredHucht/pstree' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/FredHucht/pstree' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/FredHucht/pstree -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/FredHucht/pstree' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pstree',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.40.0',
  ] as const,
  aliases: [] as const,
}

export type PstreePackage = typeof pstreePackage
