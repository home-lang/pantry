/**
 * **ack** - ack is a grep-like search tool optimized for source code.
 *
 * @domain `beyondgrep.com`
 * @programs `ack`
 * @version `3.9.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install beyondgrep.com`
 * @homepage https://beyondgrep.com/
 * @dependencies `perl.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.beyondgrepcom
 * console.log(pkg.name)        // "ack"
 * console.log(pkg.description) // "ack is a grep-like search tool optimized for so..."
 * console.log(pkg.programs)    // ["ack"]
 * console.log(pkg.versions[0]) // "3.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/beyondgrep-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const beyondgrepcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'ack' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'beyondgrep.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'ack is a grep-like search tool optimized for source code.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/beyondgrep.com/package.yml' as const,
  homepageUrl: 'https://beyondgrep.com/' as const,
  githubUrl: 'https://github.com/beyondgrep/ack3' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install beyondgrep.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +beyondgrep.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install beyondgrep.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ack',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.9.0',
    '3.8.2',
    '3.8.1',
    '3.8.0',
    '3.7.0',
    '3.6.0',
  ] as const,
  aliases: [] as const,
}

export type BeyondgrepcomPackage = typeof beyondgrepcomPackage
