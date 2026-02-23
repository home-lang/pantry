/**
 * **snipkit** - pkgx package
 *
 * @domain `github.com/lemoony/snipkit`
 * @version `1.8.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/lemoony/snipkit`
 * @buildDependencies `go.dev@^1.26`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlemoonysnipkit
 * console.log(pkg.name)        // "snipkit"
 * console.log(pkg.versions[0]) // "1.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/lemoony/snipkit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const snipkitPackage = {
  /**
  * The display name of this package.
  */
  name: 'snipkit' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/lemoony/snipkit' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lemoony/snipkit/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/lemoony/snipkit' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/lemoony/snipkit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/lemoony/snipkit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/lemoony/snipkit' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.26',
    'goreleaser.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.8.1',
  ] as const,
  aliases: [] as const,
}

export type SnipkitPackage = typeof snipkitPackage
