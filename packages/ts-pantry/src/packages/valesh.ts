/**
 * **vale** - :pencil: A markup-aware linter for prose built with speed and extensibility in mind.
 *
 * @domain `vale.sh`
 * @programs `vale`
 * @version `3.14.1` (49 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install vale.sh`
 * @homepage https://vale.sh/
 * @buildDependencies `go.dev@~1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.valesh
 * console.log(pkg.name)        // "vale"
 * console.log(pkg.description) // ":pencil: A markup-aware linter for prose built ..."
 * console.log(pkg.programs)    // ["vale"]
 * console.log(pkg.versions[0]) // "3.14.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/vale-sh.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const valeshPackage = {
  /**
  * The display name of this package.
  */
  name: 'vale' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'vale.sh' as const,
  /**
  * Brief description of what this package does.
  */
  description: ':pencil: A markup-aware linter for prose built with speed and extensibility in mind.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vale.sh/package.yml' as const,
  homepageUrl: 'https://vale.sh/' as const,
  githubUrl: 'https://github.com/errata-ai/vale' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install vale.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vale.sh -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install vale.sh' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'vale',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.14.1',
    '3.14.0',
    '3.13.1',
    '3.13.0',
    '3.12.0',
    '3.11.2',
    '3.11.1',
    '3.11.0',
    '3.10.0',
    '3.9.6',
    '3.9.5',
    '3.9.4',
    '3.9.3',
    '3.9.2',
    '3.9.1',
    '3.9.0',
    '3.8.0',
    '3.7.1',
    '3.7.0',
    '3.6.1',
  ] as const,
  aliases: [] as const,
}

export type ValeshPackage = typeof valeshPackage
