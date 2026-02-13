/**
 * **ruby-install** - Install Ruby, JRuby, Rubinius, TruffleRuby, or mruby
 *
 * @domain `github.com/postmodern/ruby-install`
 * @programs `ruby-install`
 * @version `0.10.2` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/postmodern/ruby-install`
 * @dependencies `tukaani.org/xz`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompostmodernrubyinstall
 * console.log(pkg.name)        // "ruby-install"
 * console.log(pkg.description) // "Install Ruby, JRuby, Rubinius, TruffleRuby, or ..."
 * console.log(pkg.programs)    // ["ruby-install"]
 * console.log(pkg.versions[0]) // "0.10.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/postmodern/ruby-install.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rubyinstallPackage = {
  /**
   * The display name of this package.
   */
  name: 'ruby-install' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/postmodern/ruby-install' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Install Ruby, JRuby, Rubinius, TruffleRuby, or mruby' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/postmodern/ruby-install/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/postmodern/ruby-install' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/postmodern/ruby-install' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/postmodern/ruby-install -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/postmodern/ruby-install' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ruby-install',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'tukaani.org/xz',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
  ] as const,
  aliases: [] as const,
}

export type RubyinstallPackage = typeof rubyinstallPackage
