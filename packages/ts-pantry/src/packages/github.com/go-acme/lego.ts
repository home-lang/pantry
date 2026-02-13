/**
 * **lego** - Let's Encrypt/ACME client and library written in Go
 *
 * @domain `github.com/go-acme/lego`
 * @programs `lego`
 * @version `4.31.0` (30 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/go-acme/lego`
 * @homepage https://go-acme.github.io/lego/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgoacmelego
 * console.log(pkg.name)        // "lego"
 * console.log(pkg.description) // "Let's Encrypt/ACME client and library written i..."
 * console.log(pkg.programs)    // ["lego"]
 * console.log(pkg.versions[0]) // "4.31.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/go-acme/lego.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const legoPackage = {
  /**
   * The display name of this package.
   */
  name: 'lego' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/go-acme/lego' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Let\'s Encrypt/ACME client and library written in Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/go-acme/lego/package.yml' as const,
  homepageUrl: 'https://go-acme.github.io/lego/' as const,
  githubUrl: 'https://github.com/go-acme/lego' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/go-acme/lego' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/go-acme/lego -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/go-acme/lego' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lego',
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
    '4.31.0',
    '4.30.1',
    '4.29.0',
    '4.28.1',
    '4.28.0',
    '4.27.0',
    '4.26.0',
    '4.25.2',
    '4.25.1',
    '4.25.0',
    '4.24.0',
    '4.23.1',
    '4.23.0',
    '4.22.2',
    '4.22.1',
    '4.22.0',
    '4.21.0',
    '4.20.4',
    '4.20.3',
    '4.20.2',
    '4.19.2',
    '4.19.1',
    '4.19.0',
    '4.18.0',
    '4.17.4',
    '4.17.3',
    '4.16.1',
    '4.16.0',
    '4.15.0',
    '4.14.2',
  ] as const,
  aliases: [] as const,
}

export type LegoPackage = typeof legoPackage
