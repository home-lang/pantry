/**
 * **1Password CLI** - pkgx package
 *
 * @domain `developer.1password.com/1password-cli`
 * @programs `op`
 * @version `2.32.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install developer.1password.com/1password-cli`
 * @buildDependencies `gnupg.org@^2`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.developer1passwordcom1passwordcli
 * console.log(pkg.name)        // "1Password CLI"
 * console.log(pkg.programs)    // ["op"]
 * console.log(pkg.versions[0]) // "2.32.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/developer-1password-com/1password-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const developer1passwordcom1passwordcliPackage = {
  /**
   * The display name of this package.
   */
  name: '1Password CLI' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'developer.1password.com/1password-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/developer.1password.com/1password-cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install developer.1password.com/1password-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +developer.1password.com/1password-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install developer.1password.com/1password-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'op',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnupg.org@^2',
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.32.0',
    '2.31.1',
    '2.31.0',
    '2.30.3',
  ] as const,
  aliases: [] as const,
}

export type Developer1passwordcom1passwordcliPackage = typeof developer1passwordcom1passwordcliPackage
