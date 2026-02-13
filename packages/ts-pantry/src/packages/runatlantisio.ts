/**
 * **atlantis** - Terraform Pull Request Automation tool
 *
 * @domain `runatlantis.io`
 * @programs `atlantis`
 * @version `0.39.0` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install runatlantis.io`
 * @homepage https://www.runatlantis.io/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.runatlantisio
 * console.log(pkg.name)        // "atlantis"
 * console.log(pkg.description) // "Terraform Pull Request Automation tool"
 * console.log(pkg.programs)    // ["atlantis"]
 * console.log(pkg.versions[0]) // "0.39.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/runatlantis-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const runatlantisioPackage = {
  /**
   * The display name of this package.
   */
  name: 'atlantis' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'runatlantis.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terraform Pull Request Automation tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/runatlantis.io/package.yml' as const,
  homepageUrl: 'https://www.runatlantis.io/' as const,
  githubUrl: 'https://github.com/runatlantis/atlantis' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install runatlantis.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +runatlantis.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install runatlantis.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'atlantis',
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
    '0.39.0',
    '0.38.0',
    '0.37.1',
    '0.37.0',
    '0.36.0',
    '0.35.1',
    '0.35.0',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.0',
    '0.28.5',
    '0.28.4',
    '0.28.3',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.3',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.0',
    '0.25.0',
  ] as const,
  aliases: [] as const,
}

export type RunatlantisioPackage = typeof runatlantisioPackage
