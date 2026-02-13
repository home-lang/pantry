/**
 * **mackup** - Keep your application settings in sync (OS X/Linux)
 *
 * @domain `github.com/lra/mackup`
 * @programs `mackup`
 * @version `0.10.1` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/lra/mackup`
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlramackup
 * console.log(pkg.name)        // "mackup"
 * console.log(pkg.description) // "Keep your application settings in sync (OS X/Li..."
 * console.log(pkg.programs)    // ["mackup"]
 * console.log(pkg.versions[0]) // "0.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/lra/mackup.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mackupPackage = {
  /**
   * The display name of this package.
   */
  name: 'mackup' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/lra/mackup' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Keep your application settings in sync (OS X/Linux)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lra/mackup/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/lra/mackup' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/lra/mackup' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/lra/mackup -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/lra/mackup' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mackup',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.1',
    '0.10.0',
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.43',
    '0.8.42',
    '0.8.41',
    '0.8.40',
    '0.8.39',
    '0.8.38',
    '0.8.37',
    '0.8.36',
  ] as const,
  aliases: [] as const,
}

export type MackupPackage = typeof mackupPackage
