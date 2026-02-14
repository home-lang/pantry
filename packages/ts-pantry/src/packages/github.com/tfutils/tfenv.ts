/**
 * **tfenv** - Terraform version manager
 *
 * @domain `github.com/tfutils/tfenv`
 * @programs `tfenv`
 * @version `3.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/tfutils/tfenv`
 * @dependencies `gnu.org/grep`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomtfutilstfenv
 * console.log(pkg.name)        // "tfenv"
 * console.log(pkg.description) // "Terraform version manager"
 * console.log(pkg.programs)    // ["tfenv"]
 * console.log(pkg.versions[0]) // "3.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/tfutils/tfenv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tfenvPackage = {
  /**
  * The display name of this package.
  */
  name: 'tfenv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/tfutils/tfenv' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Terraform version manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/tfutils/tfenv/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/tfutils/tfenv' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/tfutils/tfenv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/tfutils/tfenv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/tfutils/tfenv' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tfenv',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/grep',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.0.0',
  ] as const,
  aliases: [] as const,
}

export type TfenvPackage = typeof tfenvPackage
