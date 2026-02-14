/**
 * **k3sup** - Utility to create k3s clusters on any local or remote VM
 *
 * @domain `github.com/alexellis/k3sup`
 * @programs `k3sup`
 * @version `0.13.11` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/alexellis/k3sup`
 * @homepage https://k3sup.dev
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomalexellisk3sup
 * console.log(pkg.name)        // "k3sup"
 * console.log(pkg.description) // "Utility to create k3s clusters on any local or ..."
 * console.log(pkg.programs)    // ["k3sup"]
 * console.log(pkg.versions[0]) // "0.13.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/alexellis/k3sup.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const k3supPackage = {
  /**
  * The display name of this package.
  */
  name: 'k3sup' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/alexellis/k3sup' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Utility to create k3s clusters on any local or remote VM' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/alexellis/k3sup/package.yml' as const,
  homepageUrl: 'https://k3sup.dev' as const,
  githubUrl: 'https://github.com/alexellis/k3sup' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/alexellis/k3sup' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/alexellis/k3sup -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/alexellis/k3sup' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'k3sup',
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
    '0.13.11',
    '0.13.10',
    '0.13.9',
    '0.13.8',
    '0.13.6',
    '0.13.5',
    '0.13.4',
    '0.13.3',
    '0.13.2',
    '0.13.1',
  ] as const,
  aliases: [] as const,
}

export type K3supPackage = typeof k3supPackage
