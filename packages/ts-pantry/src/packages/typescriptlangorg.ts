/**
 * **tsc** - TypeScript is a superset of JavaScript that compiles to clean JavaScript output.
 *
 * @domain `typescriptlang.org`
 * @programs `tsc`
 * @version `5.9.3` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install typescriptlang.org`
 * @homepage https://www.typescriptlang.org/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.typescriptlangorg
 * console.log(pkg.name)        // "tsc"
 * console.log(pkg.description) // "TypeScript is a superset of JavaScript that com..."
 * console.log(pkg.programs)    // ["tsc"]
 * console.log(pkg.versions[0]) // "5.9.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/typescriptlang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const typescriptlangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'tsc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'typescriptlang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/typescriptlang.org/package.yml' as const,
  homepageUrl: 'https://www.typescriptlang.org/' as const,
  githubUrl: 'https://github.com/Microsoft/TypeScript' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install typescriptlang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +typescriptlang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install typescriptlang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tsc',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org^20',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.9.3',
    '5.9.2',
    '5.8.3',
    '5.8.2',
    '5.7.3',
    '5.7.2',
    '5.6.3',
    '5.6.2',
    '5.5.4',
    '5.5.3',
    '5.5.2',
    '5.4.5',
    '5.4.4',
    '5.4.3',
    '5.4.2',
  ] as const,
  aliases: [] as const,
}

export type TypescriptlangorgPackage = typeof typescriptlangorgPackage
