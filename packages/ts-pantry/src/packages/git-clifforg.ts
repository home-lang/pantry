/**
 * **git-cliff** - A highly customizable Changelog Generator that follows Conventional Commit specifications ⛰️
 *
 * @domain `git-cliff.org`
 * @programs `git-cliff`
 * @version `2.12.0` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install git-cliff.org`
 * @homepage https://git-cliff.org
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitclifforg
 * console.log(pkg.name)        // "git-cliff"
 * console.log(pkg.description) // "A highly customizable Changelog Generator that ..."
 * console.log(pkg.programs)    // ["git-cliff"]
 * console.log(pkg.versions[0]) // "2.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/git-cliff-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitclifforgPackage = {
  /**
   * The display name of this package.
   */
  name: 'git-cliff' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'git-cliff.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A highly customizable Changelog Generator that follows Conventional Commit specifications ⛰️ ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/git-cliff.org/package.yml' as const,
  homepageUrl: 'https://git-cliff.org' as const,
  githubUrl: 'https://github.com/orhun/git-cliff' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install git-cliff.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +git-cliff.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install git-cliff.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'git-cliff',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.12.0',
    '2.11.0',
    '2.10.1',
    '2.10.0',
    '2.9.1',
    '2.9.0',
    '2.8.0',
    '2.7.0',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.2',
    '2.1.1',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.4.0',
    '1.3.1',
    '1.3.0',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type GitclifforgPackage = typeof gitclifforgPackage
