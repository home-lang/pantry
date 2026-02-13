/**
 * **sympy** - A computer algebra system written in pure Python
 *
 * @domain `sympy.org`
 * @version `1.14.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sympy.org`
 * @homepage https://sympy.org/
 * @dependencies `python.org>=3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sympyorg
 * console.log(pkg.name)        // "sympy"
 * console.log(pkg.description) // "A computer algebra system written in pure Python"
 * console.log(pkg.versions[0]) // "1.14.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sympy-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sympyorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'sympy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sympy.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A computer algebra system written in pure Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sympy.org/package.yml' as const,
  homepageUrl: 'https://sympy.org/' as const,
  githubUrl: 'https://github.com/sympy/sympy' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sympy.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sympy.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sympy.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.14.0',
    '1.13.3',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.1',
    '1.12.0',
  ] as const,
  aliases: [] as const,
}

export type SympyorgPackage = typeof sympyorgPackage
