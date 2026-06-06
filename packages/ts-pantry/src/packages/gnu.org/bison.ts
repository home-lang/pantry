/**
 * **bison** - Parser generator
 *
 * @domain `gnu.org/bison`
 * @programs `bison`, `yacc`
 * @version `3.8.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gnu.org/bison`
 * @homepage https://www.gnu.org/software/bison/
 * @dependencies `gnu.org/m4@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.gnuorgbison
 * console.log(pkg.name)        // "bison"
 * console.log(pkg.description) // "Parser generator"
 * console.log(pkg.programs)    // ["bison", "yacc"]
 * console.log(pkg.versions[0]) // "3.8.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/gnu-org/bison.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const gnuorgbisonPackage = {
  /**
  * The display name of this package.
  */
  name: 'bison' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/bison' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Parser generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/bison/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/bison/' as const,
  githubUrl: 'https://github.com/akimd/bison' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install gnu.org/bison' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/bison -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install gnu.org/bison' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bison',
    'yacc',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/m4@1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.8.2',
    '3.8.1',
    '3.8',
    '3.7.91',
    '3.7.90',
    '3.7.6',
    '3.7.5',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7',
    '3.6.93',
    '3.6.92',
    '3.6.91',
    '3.6.90',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.6.1',
    '3.6',
    '3.5.94',
    '3.5.93',
    '3.5.92',
    '3.5.91',
    '3.5.90',
    '3.5.4',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5',
    '3.4.92',
    '3.4.91',
    '3.4.90',
    '3.4.2',
    '3.4.1',
    '3.4',
    '3.3.91',
    '3.3.90',
    '3.3.2',
    '3.3.1',
    '3.3',
    '3.2.91',
    '3.2.90',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1.0',
    '3.2.1',
    '3.2',
  ] as const,
  aliases: [] as const,
}

export type GnuorgbisonPackage = typeof gnuorgbisonPackage
