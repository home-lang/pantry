/**
 * **genqlient** - a truly type-safe Go GraphQL client
 *
 * @domain `khanacademy.org/genqlient`
 * @programs `genqlient`
 * @version `0.8.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install khanacademy.org/genqlient`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.khanacademyorggenqlient
 * console.log(pkg.name)        // "genqlient"
 * console.log(pkg.description) // "a truly type-safe Go GraphQL client"
 * console.log(pkg.programs)    // ["genqlient"]
 * console.log(pkg.versions[0]) // "0.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/khanacademy-org/genqlient.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const khanacademyorggenqlientPackage = {
  /**
   * The display name of this package.
   */
  name: 'genqlient' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'khanacademy.org/genqlient' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'a truly type-safe Go GraphQL client' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/khanacademy.org/genqlient/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Khan/genqlient' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install khanacademy.org/genqlient' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +khanacademy.org/genqlient -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install khanacademy.org/genqlient' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'genqlient',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.1',
    '0.8.0',
    '0.7.0',
    '0.6.0',
  ] as const,
  aliases: [] as const,
}

export type KhanacademyorggenqlientPackage = typeof khanacademyorggenqlientPackage
