/**
 * **sqlboiler** - Generate a Go ORM tailored to your database schema.
 *
 * @domain `github.com/volatiletech/sqlboiler`
 * @programs `sqlboiler`
 * @version `4.19.5` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/volatiletech/sqlboiler`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomvolatiletechsqlboiler
 * console.log(pkg.name)        // "sqlboiler"
 * console.log(pkg.description) // "Generate a Go ORM tailored to your database sch..."
 * console.log(pkg.programs)    // ["sqlboiler"]
 * console.log(pkg.versions[0]) // "4.19.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/volatiletech/sqlboiler.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sqlboilerPackage = {
  /**
  * The display name of this package.
  */
  name: 'sqlboiler' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/volatiletech/sqlboiler' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Generate a Go ORM tailored to your database schema.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/volatiletech/sqlboiler/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/volatiletech/sqlboiler' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/volatiletech/sqlboiler' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/volatiletech/sqlboiler -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/volatiletech/sqlboiler' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sqlboiler',
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
    '4.19.5',
    '4.19.4',
    '4.19.3',
    '4.19.2',
    '4.19.1',
    '4.19.0',
    '4.18.0',
    '4.17.1',
    '4.17.0',
    '4.16.2',
    '4.16.1',
    '4.16.0',
    '4.15.0',
  ] as const,
  aliases: [] as const,
}

export type SqlboilerPackage = typeof sqlboilerPackage
