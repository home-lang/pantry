/**
 * **unrar** - pkgx package
 *
 * @domain `rarlab.com`
 * @programs `unrar`
 * @version `7.2.4` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rarlab.com`
 * @buildDependencies `gnu.org/coreutils@^9` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rarlabcom
 * console.log(pkg.name)        // "unrar"
 * console.log(pkg.programs)    // ["unrar"]
 * console.log(pkg.versions[0]) // "7.2.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rarlab-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rarlabcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'unrar' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rarlab.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rarlab.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rarlab.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rarlab.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rarlab.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'unrar',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/coreutils@^9',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.2.4',
    '7.2.3',
    '7.2.2',
    '7.2.1',
    '7.1.10',
    '7.1.9',
    '7.1.8',
    '7.1.7',
    '7.1.6',
    '7.1.5',
    '7.1.4',
    '7.1.2',
    '7.1.1',
    '7.0.9',
    '7.0.8',
    '7.0.7',
    '7.0.6',
    '7.0.5',
    '7.0.4',
    '7.0.3',
    '7.0.2',
    '7.0.1',
    '6.2.12',
    '6.2.11',
    '6.2.10',
    '6.2.9',
    '6.2.8',
  ] as const,
  aliases: [] as const,
}

export type RarlabcomPackage = typeof rarlabcomPackage
