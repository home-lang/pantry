/**
 * **commit** - Command-line tool to guide your template commit messages anywhere, anytime
 *
 * @domain `github.com/alt-art/commit`
 * @programs `commit`
 * @version `0.7.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/alt-art/commit`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomaltartcommit
 * console.log(pkg.name)        // "commit"
 * console.log(pkg.description) // "Command-line tool to guide your template commit..."
 * console.log(pkg.programs)    // ["commit"]
 * console.log(pkg.versions[0]) // "0.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/alt-art/commit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const commitPackage = {
  /**
   * The display name of this package.
   */
  name: 'commit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/alt-art/commit' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line tool to guide your template commit messages anywhere, anytime' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/alt-art/commit/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/alt-art/commit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/alt-art/commit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/alt-art/commit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/alt-art/commit' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'commit',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.0',
    '0.6.0',
  ] as const,
  aliases: [] as const,
}

export type CommitPackage = typeof commitPackage
