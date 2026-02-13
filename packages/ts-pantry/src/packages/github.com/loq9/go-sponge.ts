/**
 * **go-sponge** - Golang alternative of sponge tool
 *
 * @domain `github.com/loq9/go-sponge`
 * @programs `go-sponge`
 * @version `1.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/loq9/go-sponge`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomloq9gosponge
 * console.log(pkg.name)        // "go-sponge"
 * console.log(pkg.description) // "Golang alternative of sponge tool"
 * console.log(pkg.programs)    // ["go-sponge"]
 * console.log(pkg.versions[0]) // "1.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/loq9/go-sponge.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gospongePackage = {
  /**
   * The display name of this package.
   */
  name: 'go-sponge' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/loq9/go-sponge' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Golang alternative of sponge tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/loq9/go-sponge/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/LOQ9/go-sponge' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/loq9/go-sponge' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/loq9/go-sponge -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/loq9/go-sponge' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'go-sponge',
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
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type GospongePackage = typeof gospongePackage
