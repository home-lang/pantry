/**
 * **restic** - Fast, efficient and secure backup program
 *
 * @domain `restic.net/restic`
 * @programs `restic`
 * @version `0.18.1` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install restic.net/restic`
 * @homepage https://restic.net/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.resticnetrestic
 * console.log(pkg.name)        // "restic"
 * console.log(pkg.description) // "Fast, efficient and secure backup program"
 * console.log(pkg.programs)    // ["restic"]
 * console.log(pkg.versions[0]) // "0.18.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/restic-net/restic.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const resticnetresticPackage = {
  /**
  * The display name of this package.
  */
  name: 'restic' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'restic.net/restic' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Fast, efficient and secure backup program' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/restic.net/restic/package.yml' as const,
  homepageUrl: 'https://restic.net/' as const,
  githubUrl: 'https://github.com/restic/restic' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install restic.net/restic' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +restic.net/restic -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install restic.net/restic' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'restic',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.18.1',
    '0.18.0',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.5',
    '0.16.4',
    '0.16.3',
    '0.16.2',
  ] as const,
  aliases: [] as const,
}

export type ResticnetresticPackage = typeof resticnetresticPackage
