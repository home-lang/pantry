/**
 * **mactop** - Apple Silicon Monitor Top written in Golang
 *
 * @domain `github.com/context-labs/mactop`
 * @programs `mactop`
 * @version `0.2.7` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/context-labs/mactop`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcontextlabsmactop
 * console.log(pkg.name)        // "mactop"
 * console.log(pkg.description) // "Apple Silicon Monitor Top written in Golang"
 * console.log(pkg.programs)    // ["mactop"]
 * console.log(pkg.versions[0]) // "0.2.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/context-labs/mactop.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mactopPackage = {
  /**
  * The display name of this package.
  */
  name: 'mactop' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/context-labs/mactop' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Apple Silicon Monitor Top written in Golang' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/context-labs/mactop/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/context-labs/mactop' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/context-labs/mactop' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/context-labs/mactop -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/context-labs/mactop' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mactop',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.7',
    '0.2.6',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.9',
    '0.1.8',
    '0.1.7',
  ] as const,
  aliases: [] as const,
}

export type MactopPackage = typeof mactopPackage
