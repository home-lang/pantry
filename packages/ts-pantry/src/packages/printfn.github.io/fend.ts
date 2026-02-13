/**
 * **fend** - Arbitrary-precision unit-aware calculator
 *
 * @domain `printfn.github.io/fend`
 * @programs `fend`
 * @version `1.5.7` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install printfn.github.io/fend`
 * @homepage https://printfn.github.io/fend
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.printfngithubiofend
 * console.log(pkg.name)        // "fend"
 * console.log(pkg.description) // "Arbitrary-precision unit-aware calculator"
 * console.log(pkg.programs)    // ["fend"]
 * console.log(pkg.versions[0]) // "1.5.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/printfn-github-io/fend.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const printfngithubiofendPackage = {
  /**
   * The display name of this package.
   */
  name: 'fend' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'printfn.github.io/fend' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Arbitrary-precision unit-aware calculator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/printfn.github.io/fend/package.yml' as const,
  homepageUrl: 'https://printfn.github.io/fend' as const,
  githubUrl: 'https://github.com/printfn/fend' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install printfn.github.io/fend' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +printfn.github.io/fend -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install printfn.github.io/fend' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fend',
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.7',
    '1.5.6',
    '1.5.5',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.9',
    '1.4.8',
    '1.4.7',
    '1.4.6',
    '1.4.5',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.3',
    '1.3.2',
  ] as const,
  aliases: [] as const,
}

export type PrintfngithubiofendPackage = typeof printfngithubiofendPackage
