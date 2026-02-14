/**
 * **flex** - The Fast Lexical Analyzer - scanner generator for lexing in C and C++
 *
 * @domain `github.com/westes/flex`
 * @programs `flex`, `flex++`
 * @version `2.6.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/westes/flex`
 * @dependencies `gnu.org/gettext^0`, `gnu.org/m4^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomwestesflex
 * console.log(pkg.name)        // "flex"
 * console.log(pkg.description) // "The Fast Lexical Analyzer - scanner generator f..."
 * console.log(pkg.programs)    // ["flex", "flex++"]
 * console.log(pkg.versions[0]) // "2.6.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/westes/flex.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const flexPackage = {
  /**
  * The display name of this package.
  */
  name: 'flex' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/westes/flex' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Fast Lexical Analyzer - scanner generator for lexing in C and C++' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/westes/flex/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/westes/flex' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/westes/flex' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/westes/flex -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/westes/flex' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'flex',
    'flex++',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/gettext^0',
    'gnu.org/m4^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.6.4',
  ] as const,
  aliases: [] as const,
}

export type FlexPackage = typeof flexPackage
