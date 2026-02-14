/**
 * **aiac** - Artificial Intelligence Infrastructure-as-Code Generator.
 *
 * @domain `github.com/gofireflyio/aiac`
 * @programs `aiac`
 * @version `5.3.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/gofireflyio/aiac`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgofireflyioaiac
 * console.log(pkg.name)        // "aiac"
 * console.log(pkg.description) // "Artificial Intelligence Infrastructure-as-Code ..."
 * console.log(pkg.programs)    // ["aiac"]
 * console.log(pkg.versions[0]) // "5.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/gofireflyio/aiac.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const aiacPackage = {
  /**
  * The display name of this package.
  */
  name: 'aiac' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/gofireflyio/aiac' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Artificial Intelligence Infrastructure-as-Code Generator.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/gofireflyio/aiac/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/gofireflyio/aiac' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/gofireflyio/aiac' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/gofireflyio/aiac -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/gofireflyio/aiac' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'aiac',
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
    '5.3.0',
    '5.2.1',
    '5.2.0',
    '5.1.1',
    '5.1.0',
    '5.0.1',
    '5.0.0',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.0',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type AiacPackage = typeof aiacPackage
