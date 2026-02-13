/**
 * **age** - A simple, modern and secure encryption tool (and Go library) with small explicit keys, no config options, and UNIX-style composability.
 *
 * @domain `filippo.io/age`
 * @programs `age`, `age-keygen`
 * @version `1.3.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install filippo.io/age`
 * @homepage https://age-encryption.org
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.filippoioage
 * console.log(pkg.name)        // "age"
 * console.log(pkg.description) // "A simple, modern and secure encryption tool (an..."
 * console.log(pkg.programs)    // ["age", "age-keygen"]
 * console.log(pkg.versions[0]) // "1.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/filippo-io/age.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const filippoioagePackage = {
  /**
   * The display name of this package.
   */
  name: 'age' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'filippo.io/age' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A simple, modern and secure encryption tool (and Go library) with small explicit keys, no config options, and UNIX-style composability.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/filippo.io/age/package.yml' as const,
  homepageUrl: 'https://age-encryption.org' as const,
  githubUrl: 'https://github.com/FiloSottile/age' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install filippo.io/age' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +filippo.io/age -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install filippo.io/age' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'age',
    'age-keygen',
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
    '1.3.1',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.1',
  ] as const,
  aliases: [] as const,
}

export type FilippoioagePackage = typeof filippoioagePackage
