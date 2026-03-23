/**
 * **watchexec** - Executes commands in response to file modifications
 *
 * @domain `watchexec.github.io`
 * @programs `watchexec`
 * @version `2.5.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install watchexec.github.io`
 * @homepage https://watchexec.github.io/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.watchexecgithubio
 * console.log(pkg.name)        // "watchexec"
 * console.log(pkg.description) // "Executes commands in response to file modificat..."
 * console.log(pkg.programs)    // ["watchexec"]
 * console.log(pkg.versions[0]) // "2.5.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/watchexec-github-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const watchexecgithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'watchexec' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'watchexec.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Executes commands in response to file modifications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/watchexec.github.io/package.yml' as const,
  homepageUrl: 'https://watchexec.github.io/' as const,
  githubUrl: 'https://github.com/watchexec/watchexec' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install watchexec.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +watchexec.github.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install watchexec.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'watchexec',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.5.0',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.0',
    '1.25.1',
    '1.25.0',
    '1.24.2',
    '1.24.1',
    '1.24.0',
  ] as const,
  aliases: [] as const,
}

export type WatchexecgithubioPackage = typeof watchexecgithubioPackage
