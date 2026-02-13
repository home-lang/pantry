/**
 * **diff-so-fancy** - Good-lookin' diffs. Actually… nah… The best-lookin' diffs. :tada:
 *
 * @domain `github.com/so-fancy/diff-so-fancy`
 * @programs `diff-so-fancy`
 * @version `1.4.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/so-fancy/diff-so-fancy`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsofancydiffsofancy
 * console.log(pkg.name)        // "diff-so-fancy"
 * console.log(pkg.description) // "Good-lookin' diffs. Actually… nah… The best-loo..."
 * console.log(pkg.programs)    // ["diff-so-fancy"]
 * console.log(pkg.versions[0]) // "1.4.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/so-fancy/diff-so-fancy.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const diffsofancyPackage = {
  /**
   * The display name of this package.
   */
  name: 'diff-so-fancy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/so-fancy/diff-so-fancy' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Good-lookin\' diffs. Actually… nah… The best-lookin\' diffs. :tada:' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/so-fancy/diff-so-fancy/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/so-fancy/diff-so-fancy' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/so-fancy/diff-so-fancy' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/so-fancy/diff-so-fancy -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/so-fancy/diff-so-fancy' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'diff-so-fancy',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.4',
  ] as const,
  aliases: [] as const,
}

export type DiffsofancyPackage = typeof diffsofancyPackage
