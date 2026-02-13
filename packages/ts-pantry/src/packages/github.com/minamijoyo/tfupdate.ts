/**
 * **tfupdate** - Update version constraints in your Terraform configurations
 *
 * @domain `github.com/minamijoyo/tfupdate`
 * @programs `tfupdate`
 * @version `0.9.3` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/minamijoyo/tfupdate`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomminamijoyotfupdate
 * console.log(pkg.name)        // "tfupdate"
 * console.log(pkg.description) // "Update version constraints in your Terraform co..."
 * console.log(pkg.programs)    // ["tfupdate"]
 * console.log(pkg.versions[0]) // "0.9.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/minamijoyo/tfupdate.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tfupdatePackage = {
  /**
   * The display name of this package.
   */
  name: 'tfupdate' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/minamijoyo/tfupdate' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Update version constraints in your Terraform configurations' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/minamijoyo/tfupdate/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/minamijoyo/tfupdate' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/minamijoyo/tfupdate' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/minamijoyo/tfupdate -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/minamijoyo/tfupdate' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tfupdate',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.5',
    '0.8.4',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.2',
  ] as const,
  aliases: [] as const,
}

export type TfupdatePackage = typeof tfupdatePackage
