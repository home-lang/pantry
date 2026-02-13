/**
 * **gron** - Make JSON greppable!
 *
 * @domain `github.com/tomnomnom/gron`
 * @programs `gron`
 * @version `0.7.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/tomnomnom/gron`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomtomnomnomgron
 * console.log(pkg.name)        // "gron"
 * console.log(pkg.description) // "Make JSON greppable!"
 * console.log(pkg.programs)    // ["gron"]
 * console.log(pkg.versions[0]) // "0.7.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/tomnomnom/gron.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gronPackage = {
  /**
   * The display name of this package.
   */
  name: 'gron' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/tomnomnom/gron' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Make JSON greppable!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/tomnomnom/gron/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/tomnomnom/gron' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/tomnomnom/gron' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/tomnomnom/gron -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/tomnomnom/gron' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gron',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.1',
  ] as const,
  aliases: [] as const,
}

export type GronPackage = typeof gronPackage
