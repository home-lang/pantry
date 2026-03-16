/**
 * **dotenv-linter** - ⚡️Lightning-fast linter for .env files. Written in Rust 🦀
 *
 * @domain `dotenv-linter.github.io`
 * @programs `dotenv-linter`
 * @version `4.0.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install dotenv-linter.github.io`
 * @homepage https://dotenv-linter.github.io
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.dotenvlintergithubio
 * console.log(pkg.name)        // "dotenv-linter"
 * console.log(pkg.description) // "⚡️Lightning-fast linter for .env files. Written..."
 * console.log(pkg.programs)    // ["dotenv-linter"]
 * console.log(pkg.versions[0]) // "4.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/dotenv-linter-github-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const dotenvlintergithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'dotenv-linter' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dotenv-linter.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '⚡️Lightning-fast linter for .env files. Written in Rust 🦀' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dotenv-linter.github.io/package.yml' as const,
  homepageUrl: 'https://dotenv-linter.github.io' as const,
  githubUrl: 'https://github.com/dotenv-linter/dotenv-linter' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install dotenv-linter.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dotenv-linter.github.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install dotenv-linter.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dotenv-linter',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.0.0',
    '3.3.0',
  ] as const,
  aliases: [] as const,
}

export type DotenvlintergithubioPackage = typeof dotenvlintergithubioPackage
