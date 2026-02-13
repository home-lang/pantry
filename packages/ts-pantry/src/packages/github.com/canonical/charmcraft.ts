/**
 * **charmcraft** - Collaborate, build and publish charmed operators for Kubernetes, Linux and Windows.
 *
 * @domain `github.com/canonical/charmcraft`
 * @programs `charmcraft`
 * @version `4.1.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/canonical/charmcraft`
 * @homepage https://charmhub.io
 * @dependencies `pkgx.sh^1`, `libgit2.org~1.9 # as of v4.1.0`
 * @buildDependencies `python.org@~3.13` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcanonicalcharmcraft
 * console.log(pkg.name)        // "charmcraft"
 * console.log(pkg.description) // "Collaborate, build and publish charmed operator..."
 * console.log(pkg.programs)    // ["charmcraft"]
 * console.log(pkg.versions[0]) // "4.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/canonical/charmcraft.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmcraftPackage = {
  /**
   * The display name of this package.
   */
  name: 'charmcraft' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/canonical/charmcraft' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Collaborate, build and publish charmed operators for Kubernetes, Linux and Windows.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/canonical/charmcraft/package.yml' as const,
  homepageUrl: 'https://charmhub.io' as const,
  githubUrl: 'https://github.com/canonical/charmcraft' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/canonical/charmcraft' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/canonical/charmcraft -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/canonical/charmcraft' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'charmcraft',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
    'libgit2.org~1.9 # as of v4.1.0',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.1.0',
    '4.0.1',
    '4.0.0',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.3',
    '3.3.3',
    '3.3.2',
    '3.3.0',
    '3.2.2',
    '3.2.1',
    '2.7.6',
    '2.7.5',
  ] as const,
  aliases: [] as const,
}

export type CharmcraftPackage = typeof charmcraftPackage
