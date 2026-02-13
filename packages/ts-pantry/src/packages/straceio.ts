/**
 * **strace** - strace is a diagnostic, debugging and instructional userspace utility for Linux
 *
 * @domain `strace.io`
 * @programs `strace`
 * @version `6.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install strace.io`
 * @homepage https://strace.io/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.straceio
 * console.log(pkg.name)        // "strace"
 * console.log(pkg.description) // "strace is a diagnostic, debugging and instructi..."
 * console.log(pkg.programs)    // ["strace"]
 * console.log(pkg.versions[0]) // "6.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/strace-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const straceioPackage = {
  /**
   * The display name of this package.
   */
  name: 'strace' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'strace.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'strace is a diagnostic, debugging and instructional userspace utility for Linux' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/strace.io/package.yml' as const,
  homepageUrl: 'https://strace.io/' as const,
  githubUrl: 'https://github.com/strace/strace' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install strace.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +strace.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install strace.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'strace',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.2.0',
  ] as const,
  aliases: [] as const,
}

export type StraceioPackage = typeof straceioPackage
