/**
 * **re2c** - Lexer generator for C, C++, D, Go, Haskell, Java, JS, OCaml, Python, Rust, V and Zig.
 *
 * @domain `re2c.org`
 * @programs `re2c`
 * @version `4.4.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install re2c.org`
 * @homepage https://re2c.org
 * @buildDependencies `python.org@^3.10` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.re2corg
 * console.log(pkg.name)        // "re2c"
 * console.log(pkg.description) // "Lexer generator for C, C++, D, Go, Haskell, Jav..."
 * console.log(pkg.programs)    // ["re2c"]
 * console.log(pkg.versions[0]) // "4.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/re2c-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const re2corgPackage = {
  /**
   * The display name of this package.
   */
  name: 're2c' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 're2c.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Lexer generator for C, C++, D, Go, Haskell, Java, JS, OCaml, Python, Rust, V and Zig.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/re2c.org/package.yml' as const,
  homepageUrl: 'https://re2c.org' as const,
  githubUrl: 'https://github.com/skvadrik/re2c' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install re2c.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +re2c.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install re2c.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    're2c',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@^3.10',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.1.0',
    '3.0.0',
  ] as const,
  aliases: [] as const,
}

export type Re2corgPackage = typeof re2corgPackage
