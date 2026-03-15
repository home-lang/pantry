/**
 * **zsh** - UNIX shell (command interpreter)
 *
 * @domain `zsh.sourceforge.io`
 * @programs `zsh`
 * @version `5.9.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install zsh.sourceforge.io`
 * @homepage https://www.zsh.org/
 * @dependencies `invisible-island.net/ncurses`, `pcre.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.zshsourceforgeio
 * console.log(pkg.name)        // "zsh"
 * console.log(pkg.description) // "UNIX shell (command interpreter)"
 * console.log(pkg.programs)    // ["zsh"]
 * console.log(pkg.versions[0]) // "5.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/zsh-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zshsourceforgeioPackage = {
  /**
  * The display name of this package.
  */
  name: 'zsh' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'zsh.sourceforge.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'UNIX shell (command interpreter)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/zsh.sourceforge.io/package.yml' as const,
  homepageUrl: 'https://www.zsh.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install zsh.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +zsh.sourceforge.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install zsh.sourceforge.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'zsh',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'invisible-island.net/ncurses',
    'pcre.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.9.0',
  ] as const,
  aliases: [] as const,
}

export type ZshsourceforgeioPackage = typeof zshsourceforgeioPackage
