/**
 * **yadm** - Yet Another Dotfiles Manager
 *
 * @domain `yadm.io`
 * @programs `yadm`
 * @version `3.5.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install yadm.io`
 * @homepage https://yadm.io/
 * @dependencies `git-scm.org`, `gnu.org/bash`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.yadmio
 * console.log(pkg.name)        // "yadm"
 * console.log(pkg.description) // "Yet Another Dotfiles Manager"
 * console.log(pkg.programs)    // ["yadm"]
 * console.log(pkg.versions[0]) // "3.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/yadm-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yadmioPackage = {
  /**
  * The display name of this package.
  */
  name: 'yadm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'yadm.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Yet Another Dotfiles Manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/yadm.io/package.yml' as const,
  homepageUrl: 'https://yadm.io/' as const,
  githubUrl: 'https://github.com/yadm-dev/yadm' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install yadm.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +yadm.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install yadm.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'yadm',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'git-scm.org',
    'gnu.org/bash',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.5.0',
    '3.4.0',
    '3.3.0',
    '3.2.2',
  ] as const,
  aliases: [] as const,
}

export type YadmioPackage = typeof yadmioPackage
