/**
 * **mamba** - The Fast Cross-Platform Package Manager
 *
 * @domain `github.com/mamba-org/mamba`
 * @programs `mamba`
 * @version `22.11.1.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mamba-org/mamba`
 * @homepage https://mamba.readthedocs.io
 * @buildDependencies `aria2.github.io@1.36` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommambaorgmamba
 * console.log(pkg.name)        // "mamba"
 * console.log(pkg.description) // "The Fast Cross-Platform Package Manager"
 * console.log(pkg.programs)    // ["mamba"]
 * console.log(pkg.versions[0]) // "22.11.1.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mamba-org/mamba.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mambaPackage = {
  /**
  * The display name of this package.
  */
  name: 'mamba' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/mamba-org/mamba' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Fast Cross-Platform Package Manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mamba-org/mamba/package.yml' as const,
  homepageUrl: 'https://mamba.readthedocs.io' as const,
  githubUrl: 'https://github.com/mamba-org/mamba' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/mamba-org/mamba' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mamba-org/mamba -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mamba-org/mamba' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mamba',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'aria2.github.io@1.36',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '22.11.1.4',
  ] as const,
  aliases: [] as const,
}

export type MambaPackage = typeof mambaPackage
