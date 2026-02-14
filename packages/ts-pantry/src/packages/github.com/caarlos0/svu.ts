/**
 * **svu** - Semantic Version Util
 *
 * @domain `github.com/caarlos0/svu`
 * @programs `svu`
 * @version `3.3.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/caarlos0/svu`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcaarlos0svu
 * console.log(pkg.name)        // "svu"
 * console.log(pkg.description) // "Semantic Version Util"
 * console.log(pkg.programs)    // ["svu"]
 * console.log(pkg.versions[0]) // "3.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/caarlos0/svu.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const svuPackage = {
  /**
  * The display name of this package.
  */
  name: 'svu' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/caarlos0/svu' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Semantic Version Util' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/caarlos0/svu/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/caarlos0/svu' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/caarlos0/svu' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/caarlos0/svu -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/caarlos0/svu' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'svu',
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
    '3.3.0',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.0',
    '3.0.0',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.1',
    '2.0.0',
    '1.12.0',
    '1.11.0',
  ] as const,
  aliases: [] as const,
}

export type SvuPackage = typeof svuPackage
