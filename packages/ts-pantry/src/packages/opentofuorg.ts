/**
 * **tofu** - OpenTofu lets you declaratively manage your cloud infrastructure.
 *
 * @domain `opentofu.org`
 * @programs `tofu`
 * @version `1.11.4` (40 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install opentofu.org`
 * @homepage https://opentofu.org
 * @dependencies `linux:gnu.org/gcc/libstdcxx` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `go.dev@~1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opentofuorg
 * console.log(pkg.name)        // "tofu"
 * console.log(pkg.description) // "OpenTofu lets you declaratively manage your clo..."
 * console.log(pkg.programs)    // ["tofu"]
 * console.log(pkg.versions[0]) // "1.11.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/opentofu-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opentofuorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'tofu' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'opentofu.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'OpenTofu lets you declaratively manage your cloud infrastructure.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opentofu.org/package.yml' as const,
  homepageUrl: 'https://opentofu.org' as const,
  githubUrl: 'https://github.com/opentofu/opentofu' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install opentofu.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opentofu.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install opentofu.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tofu',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:gnu.org/gcc/libstdcxx',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.8',
    '1.10.7',
    '1.10.6',
    '1.10.5',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.11',
    '1.8.10',
    '1.8.9',
    '1.8.8',
    '1.8.7',
    '1.8.6',
    '1.8.5',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.10',
    '1.7.9',
    '1.7.8',
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
    '1.6.0.3',
  ] as const,
  aliases: [] as const,
}

export type OpentofuorgPackage = typeof opentofuorgPackage
