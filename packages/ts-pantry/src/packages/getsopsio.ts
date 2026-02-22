/**
 * **sops** - Simple and flexible tool for managing secrets
 *
 * @domain `getsops.io`
 * @programs `sops`
 * @version `3.12.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install getsops.io`
 * @homepage https://getsops.io/
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.getsopsio
 * console.log(pkg.name)        // "sops"
 * console.log(pkg.description) // "Simple and flexible tool for managing secrets"
 * console.log(pkg.programs)    // ["sops"]
 * console.log(pkg.versions[0]) // "3.12.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/getsops-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const getsopsioPackage = {
  /**
  * The display name of this package.
  */
  name: 'sops' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'getsops.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Simple and flexible tool for managing secrets' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/getsops.io/package.yml' as const,
  homepageUrl: 'https://getsops.io/' as const,
  githubUrl: 'https://github.com/getsops/sops' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install getsops.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +getsops.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install getsops.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sops',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.12.1',
    '3.11.0',
    '3.10.2',
    '3.10.1',
    '3.10.0',
    '3.9.4',
    '3.9.3',
    '3.9.2',
    '3.9.1',
    '3.9.0',
    '3.8.1',
  ] as const,
  aliases: [] as const,
}

export type GetsopsioPackage = typeof getsopsioPackage
