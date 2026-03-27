/**
 * **re2c** - Lexer generator for C, C++, D, Go, Haskell, Java, JS, OCaml, Python, Rust, V and Zig.
 *
 * @domain `re2c.org`
 * @programs `re2c`
 * @version `4.4.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install re2c.org`
 * @homepage https://re2c.org
 * @buildDependencies `python.org@^3.10` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.re2corg
 * console.log(pkg.name)        // "re2c"
 * console.log(pkg.description) // "Lexer generator for C, C++, D, Go, Haskell, Jav..."
 * console.log(pkg.programs)    // ["re2c"]
 * console.log(pkg.versions[0]) // "4.4.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/re2c-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install re2c.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +re2c.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install re2c.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.5.1',
    '4.5',
    '4.4',
    '4.4.0',
    '4.3.1',
    '4.3',
    '4.3.0',
    '4.2',
    '4.2.0',
    '4.1',
    '4.1.0',
    '4.0.2',
    '4.0.1',
    '4.0',
    '4.0.0',
    '3.1',
    '3.1.0',
    '3.0',
    '3.0.0',
    '2.2',
    '2.1.1',
    '2.1',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0',
    '1.3',
    '1.2.1',
    '1.2',
    '1.1.1',
    '1.1',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0',
    '0.16',
    '0.15.3',
    '0.14.3',
    '0.14.2',
    '0.14.1',
    '0.14',
    '0.13.7.5',
    '0.13.7.4',
    '0.13.7.3',
    '0.13.7.2',
    '0.13.7.1',
    '0.13.6',
  ] as const,
  aliases: [] as const,
}

export type Re2corgPackage = typeof re2corgPackage
