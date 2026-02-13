/**
 * **terrarium** - terraform wrapper which transparent loads env files for stacks
 *
 * @domain `github.com/terrarium-tf`
 * @programs `terrarium`
 * @version `1.3.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/terrarium-tf`
 * @dependencies `terraform.io`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomterrariumtf
 * console.log(pkg.name)        // "terrarium"
 * console.log(pkg.description) // "terraform wrapper which transparent loads env f..."
 * console.log(pkg.programs)    // ["terrarium"]
 * console.log(pkg.versions[0]) // "1.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/terrarium-tf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const terrariumtfPackage = {
  /**
   * The display name of this package.
   */
  name: 'terrarium' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/terrarium-tf' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'terraform wrapper which transparent loads env files for stacks' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/terrarium-tf/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/terrarium-tf/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/terrarium-tf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/terrarium-tf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/terrarium-tf' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'terrarium',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'terraform.io',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.2',
  ] as const,
  aliases: [] as const,
}

export type TerrariumtfPackage = typeof terrariumtfPackage
