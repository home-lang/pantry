/**
 * **license** - Command line license text generator.
 *
 * @domain `github.com/nishanths/license`
 * @programs `license`
 * @version `5.0.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nishanths/license`
 * @buildDependencies `go.dev@^1.16` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnishanthslicense
 * console.log(pkg.name)        // "license"
 * console.log(pkg.description) // "Command line license text generator."
 * console.log(pkg.programs)    // ["license"]
 * console.log(pkg.versions[0]) // "5.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nishanths/license.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const licensePackage = {
  /**
  * The display name of this package.
  */
  name: 'license' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/nishanths/license' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command line license text generator.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nishanths/license/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nishanths/license' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/nishanths/license' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nishanths/license -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nishanths/license' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'license',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.16',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.0.4',
  ] as const,
  aliases: [] as const,
}

export type LicensePackage = typeof licensePackage
