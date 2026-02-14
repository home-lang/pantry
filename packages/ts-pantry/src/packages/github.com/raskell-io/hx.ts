/**
 * **hx** - pkgx package
 *
 * @domain `github.com/raskell-io/hx`
 * @version `0.6.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/raskell-io/hx`
 * @buildDependencies `openssl.org@^1.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomraskelliohx
 * console.log(pkg.name)        // "hx"
 * console.log(pkg.versions[0]) // "0.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/raskell-io/hx.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hxPackage = {
  /**
  * The display name of this package.
  */
  name: 'hx' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/raskell-io/hx' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/raskell-io/hx/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/raskell-io/hx' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/raskell-io/hx -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/raskell-io/hx' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'openssl.org@^1.1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.0',
    '0.5.0',
    '0.4.5',
    '0.4.4',
    '0.4.3',
  ] as const,
  aliases: [] as const,
}

export type HxPackage = typeof hxPackage
