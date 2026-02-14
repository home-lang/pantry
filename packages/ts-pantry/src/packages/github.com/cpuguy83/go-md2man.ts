/**
 * **go-md2man** - Converts markdown into roff (man pages)
 *
 * @domain `github.com/cpuguy83/go-md2man`
 * @programs `go-md2man`
 * @version `2.0.7` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/cpuguy83/go-md2man`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcpuguy83gomd2man
 * console.log(pkg.name)        // "go-md2man"
 * console.log(pkg.description) // "Converts markdown into roff (man pages)"
 * console.log(pkg.programs)    // ["go-md2man"]
 * console.log(pkg.versions[0]) // "2.0.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/cpuguy83/go-md2man.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gomd2manPackage = {
  /**
  * The display name of this package.
  */
  name: 'go-md2man' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/cpuguy83/go-md2man' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Converts markdown into roff (man pages)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cpuguy83/go-md2man/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cpuguy83/go-md2man' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/cpuguy83/go-md2man' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/cpuguy83/go-md2man -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/cpuguy83/go-md2man' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'go-md2man',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.0.7',
    '2.0.6',
    '2.0.5',
    '2.0.4',
    '2.0.3',
    '2.0.2',
  ] as const,
  aliases: [] as const,
}

export type Gomd2manPackage = typeof gomd2manPackage
