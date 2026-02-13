/**
 * **jwt** - A super fast CLI tool to decode and encode JWTs built in Rust
 *
 * @domain `crates.io/jwt-cli`
 * @programs `jwt`
 * @version `6.2.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/jwt-cli`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiojwtcli
 * console.log(pkg.name)        // "jwt"
 * console.log(pkg.description) // "A super fast CLI tool to decode and encode JWTs..."
 * console.log(pkg.programs)    // ["jwt"]
 * console.log(pkg.versions[0]) // "6.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/jwt-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiojwtcliPackage = {
  /**
   * The display name of this package.
   */
  name: 'jwt' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/jwt-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A super fast CLI tool to decode and encode JWTs built in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/jwt-cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mike-engel/jwt-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/jwt-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/jwt-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/jwt-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jwt',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.2.0',
    '6.1.1',
    '6.1.0',
    '6.0.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiojwtcliPackage = typeof cratesiojwtcliPackage
