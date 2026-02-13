/**
 * **ots** - 🔐 Share end-to-end encrypted secrets with others via a one-time URL
 *
 * @domain `ots.sniptt.com`
 * @programs `ots`
 * @version `0.3.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ots.sniptt.com`
 * @homepage https://ots.sniptt.com
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.otssnipttcom
 * console.log(pkg.name)        // "ots"
 * console.log(pkg.description) // "🔐 Share end-to-end encrypted secrets with othe..."
 * console.log(pkg.programs)    // ["ots"]
 * console.log(pkg.versions[0]) // "0.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ots-sniptt-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const otssnipttcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'ots' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ots.sniptt.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🔐 Share end-to-end encrypted secrets with others via a one-time URL' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ots.sniptt.com/package.yml' as const,
  homepageUrl: 'https://ots.sniptt.com' as const,
  githubUrl: 'https://github.com/sniptt-official/ots' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ots.sniptt.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ots.sniptt.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ots.sniptt.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ots',
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
    '0.3.1',
    '0.3.0',
    '0.2.0',
  ] as const,
  aliases: [] as const,
}

export type OtssnipttcomPackage = typeof otssnipttcomPackage
