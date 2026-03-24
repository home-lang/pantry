/**
 * **chomp** - 'JS Make' - parallel task runner for the frontend ecosystem with a JS extension system.
 *
 * @domain `chompbuild.com`
 * @programs `chomp`
 * @version `0.2.23` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install chompbuild.com`
 * @homepage https://chompbuild.com
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.chompbuildcom
 * console.log(pkg.name)        // "chomp"
 * console.log(pkg.description) // "'JS Make' - parallel task runner for the fronte..."
 * console.log(pkg.programs)    // ["chomp"]
 * console.log(pkg.versions[0]) // "0.2.23" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/chompbuild-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const chompbuildcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'chomp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'chompbuild.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: '\'JS Make\' - parallel task runner for the frontend ecosystem with a JS extension system.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/chompbuild.com/package.yml' as const,
  homepageUrl: 'https://chompbuild.com' as const,
  githubUrl: 'https://github.com/guybedford/chomp' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install chompbuild.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +chompbuild.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install chompbuild.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'chomp',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.23',
    '0.2.22',
    '0.2.21',
    '0.2.20',
    '0.2.19',
    '0.2.18',
    '0.2.17',
    '0.2.16',
    '0.2.15',
    '0.2.14',
    '0.2.13',
    '0.2.12',
    '0.2.11',
    '0.2.10',
    '0.2.9',
    '0.2.8',
    '0.2.7',
    '0.2.6',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.15',
    '0.1.14',
    '0.1.13',
    '0.1.12',
    '0.1.11',
    '0.1.10',
    '0.1.9',
    '0.1.8',
    '0.1.7',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type ChompbuildcomPackage = typeof chompbuildcomPackage
