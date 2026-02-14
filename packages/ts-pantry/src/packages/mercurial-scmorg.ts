/**
 * **mercurial-scm** - Scalable distributed version control system
 *
 * @domain `mercurial-scm.org`
 * @programs `hg`, `chg`
 * @version `7.2.0` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mercurial-scm.org`
 * @homepage https://mercurial-scm.org/
 * @dependencies `python.org~3.13 # as of 7.1`
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mercurialscmorg
 * console.log(pkg.name)        // "mercurial-scm"
 * console.log(pkg.description) // "Scalable distributed version control system"
 * console.log(pkg.programs)    // ["hg", "chg"]
 * console.log(pkg.versions[0]) // "7.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mercurial-scm-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mercurialscmorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'mercurial-scm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mercurial-scm.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Scalable distributed version control system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mercurial-scm.org/package.yml' as const,
  homepageUrl: 'https://mercurial-scm.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mercurial-scm.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mercurial-scm.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mercurial-scm.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'hg',
    'chg',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.13 # as of 7.1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.2.0',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.3',
    '7.0.2',
    '7.0.1',
    '7.0.0',
    '6.9.5',
    '6.9.4',
    '6.9.3',
    '6.9.2',
    '6.9.1',
    '6.9.0',
    '6.8.2',
    '6.8.1',
    '6.8.0',
    '6.7.4',
    '6.7.3',
    '6.7.2',
    '6.7.1',
    '6.7.0',
    '6.6.3',
    '6.6.2',
    '6.6.1',
    '6.6.0',
    '6.5.3',
    '6.5.2',
    '6.5.0',
  ] as const,
  aliases: [] as const,
}

export type MercurialscmorgPackage = typeof mercurialscmorgPackage
