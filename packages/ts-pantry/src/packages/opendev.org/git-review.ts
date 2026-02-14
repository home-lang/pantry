/**
 * **git-review** - pkgx package
 *
 * @domain `opendev.org/git-review`
 * @programs `git-review`
 * @version `2.5.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install opendev.org/git-review`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opendevorggitreview
 * console.log(pkg.name)        // "git-review"
 * console.log(pkg.programs)    // ["git-review"]
 * console.log(pkg.versions[0]) // "2.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/opendev-org/git-review.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opendevorggitreviewPackage = {
  /**
  * The display name of this package.
  */
  name: 'git-review' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'opendev.org/git-review' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opendev.org/git-review/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install opendev.org/git-review' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opendev.org/git-review -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install opendev.org/git-review' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'git-review',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.5.0',
    '2.4.0',
    '2.3.1',
  ] as const,
  aliases: [] as const,
}

export type OpendevorggitreviewPackage = typeof opendevorggitreviewPackage
