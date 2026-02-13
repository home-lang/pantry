/**
 * **rawdog** - Generate and auto-execute Python scripts in the cli
 *
 * @domain `github.com/abanteai/rawdog`
 * @programs `rawdog`
 * @version `0.1.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/abanteai/rawdog`
 * @homepage https://mentat.ai
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomabanteairawdog
 * console.log(pkg.name)        // "rawdog"
 * console.log(pkg.description) // "Generate and auto-execute Python scripts in the..."
 * console.log(pkg.programs)    // ["rawdog"]
 * console.log(pkg.versions[0]) // "0.1.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/abanteai/rawdog.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rawdogPackage = {
  /**
   * The display name of this package.
   */
  name: 'rawdog' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/abanteai/rawdog' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generate and auto-execute Python scripts in the cli' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/abanteai/rawdog/package.yml' as const,
  homepageUrl: 'https://mentat.ai' as const,
  githubUrl: 'https://github.com/AbanteAI/rawdog' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/abanteai/rawdog' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/abanteai/rawdog -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/abanteai/rawdog' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rawdog',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.6',
  ] as const,
  aliases: [] as const,
}

export type RawdogPackage = typeof rawdogPackage
