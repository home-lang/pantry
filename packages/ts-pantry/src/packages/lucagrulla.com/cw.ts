/**
 * **cw** - The best way to tail AWS CloudWatch Logs from your terminal
 *
 * @domain `lucagrulla.com/cw`
 * @programs `cw`
 * @version `4.1.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lucagrulla.com/cw`
 * @homepage https://www.lucagrulla.com/cw
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.lucagrullacomcw
 * console.log(pkg.name)        // "cw"
 * console.log(pkg.description) // "The best way to tail AWS CloudWatch Logs from y..."
 * console.log(pkg.programs)    // ["cw"]
 * console.log(pkg.versions[0]) // "4.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lucagrulla-com/cw.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lucagrullacomcwPackage = {
  /**
   * The display name of this package.
   */
  name: 'cw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lucagrulla.com/cw' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The best way to tail AWS CloudWatch Logs from your terminal' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lucagrulla.com/cw/package.yml' as const,
  homepageUrl: 'https://www.lucagrulla.com/cw' as const,
  githubUrl: 'https://github.com/lucagrulla/cw' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lucagrulla.com/cw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lucagrulla.com/cw -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lucagrulla.com/cw' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cw',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.1.3',
  ] as const,
  aliases: [] as const,
}

export type LucagrullacomcwPackage = typeof lucagrullacomcwPackage
