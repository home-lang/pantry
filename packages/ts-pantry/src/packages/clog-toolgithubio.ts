/**
 * **clog** - Colorized pattern-matching log tail utility
 *
 * @domain `clog-tool.github.io`
 * @programs `clog`
 * @version `0.9.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install clog-tool.github.io`
 * @homepage https://gothenburgbitfactory.org/clog/docs/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.clogtoolgithubio
 * console.log(pkg.name)        // "clog"
 * console.log(pkg.description) // "Colorized pattern-matching log tail utility"
 * console.log(pkg.programs)    // ["clog"]
 * console.log(pkg.versions[0]) // "0.9.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/clog-tool-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const clogtoolgithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'clog' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'clog-tool.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Colorized pattern-matching log tail utility' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/clog-tool.github.io/package.yml' as const,
  homepageUrl: 'https://gothenburgbitfactory.org/clog/docs/' as const,
  githubUrl: 'https://github.com/GothenburgBitFactory/clog' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install clog-tool.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +clog-tool.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install clog-tool.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'clog',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.3',
  ] as const,
  aliases: [] as const,
}

export type ClogtoolgithubioPackage = typeof clogtoolgithubioPackage
