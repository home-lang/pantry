/**
 * **go-passbolt-cli** - A CLI tool to interact  with Passbolt, a Open source Password Manager for Teams
 *
 * @domain `github.com/passbolt/go-passbolt-cli`
 * @programs `passbolt`
 * @version `0.4.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/passbolt/go-passbolt-cli`
 * @homepage https://passbolt.com
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompassboltgopassboltcli
 * console.log(pkg.name)        // "go-passbolt-cli"
 * console.log(pkg.description) // "A CLI tool to interact  with Passbolt, a Open s..."
 * console.log(pkg.programs)    // ["passbolt"]
 * console.log(pkg.versions[0]) // "0.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/passbolt/go-passbolt-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gopassboltcliPackage = {
  /**
   * The display name of this package.
   */
  name: 'go-passbolt-cli' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/passbolt/go-passbolt-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A CLI tool to interact  with Passbolt, a Open source Password Manager for Teams ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/passbolt/go-passbolt-cli/package.yml' as const,
  homepageUrl: 'https://passbolt.com' as const,
  githubUrl: 'https://github.com/passbolt/go-passbolt-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/passbolt/go-passbolt-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/passbolt/go-passbolt-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/passbolt/go-passbolt-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'passbolt',
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
    '0.4.1',
    '0.4.0',
    '0.3.2',
    '0.3.1',
  ] as const,
  aliases: [] as const,
}

export type GopassboltcliPackage = typeof gopassboltcliPackage
