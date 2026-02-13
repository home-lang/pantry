/**
 * **chruby-exec** - Changes the current Ruby
 *
 * @domain `github.com/postmodern/chruby`
 * @programs `chruby-exec`
 * @version `0.3.9` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/postmodern/chruby`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompostmodernchruby
 * console.log(pkg.name)        // "chruby-exec"
 * console.log(pkg.description) // "Changes the current Ruby"
 * console.log(pkg.programs)    // ["chruby-exec"]
 * console.log(pkg.versions[0]) // "0.3.9" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/postmodern/chruby.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const chrubyPackage = {
  /**
   * The display name of this package.
   */
  name: 'chruby-exec' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/postmodern/chruby' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Changes the current Ruby' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/postmodern/chruby/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/postmodern/chruby' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/postmodern/chruby' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/postmodern/chruby -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/postmodern/chruby' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'chruby-exec',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.3.9',
  ] as const,
  aliases: [] as const,
}

export type ChrubyPackage = typeof chrubyPackage
