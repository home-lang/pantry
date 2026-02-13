/**
 * **eclint** - pkgx package
 *
 * @domain `gitlab.com/greut/eclint`
 * @programs `eclint`
 * @version `0.5.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gitlab.com/greut/eclint`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitlabcomgreuteclint
 * console.log(pkg.name)        // "eclint"
 * console.log(pkg.programs)    // ["eclint"]
 * console.log(pkg.versions[0]) // "0.5.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gitlab-com/greut/eclint.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitlabcomgreuteclintPackage = {
  /**
   * The display name of this package.
   */
  name: 'eclint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gitlab.com/greut/eclint' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gitlab.com/greut/eclint/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gitlab.com/greut/eclint' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gitlab.com/greut/eclint -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gitlab.com/greut/eclint' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'eclint',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.1',
    '0.5.0',
    '0.4.0',
  ] as const,
  aliases: [] as const,
}

export type GitlabcomgreuteclintPackage = typeof gitlabcomgreuteclintPackage
