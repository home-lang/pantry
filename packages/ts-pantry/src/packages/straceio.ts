/**
 * **strace** - strace is a diagnostic, debugging and instructional userspace utility for Linux
 *
 * @domain `strace.io`
 * @programs `strace`
 * @version `6.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install strace.io`
 * @homepage https://strace.io/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.straceio
 * console.log(pkg.name)        // "strace"
 * console.log(pkg.description) // "strace is a diagnostic, debugging and instructi..."
 * console.log(pkg.programs)    // ["strace"]
 * console.log(pkg.versions[0]) // "6.2.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/strace-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install strace.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +strace.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install strace.io' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '6.19',
    '6.18',
    '6.17',
    '6.16',
    '6.15',
    '6.14',
    '6.13',
    '6.12',
    '6.11',
    '6.10',
    '6.9',
    '6.8',
    '6.7',
    '6.6',
    '6.5',
    '6.4',
    '6.3',
    '6.2',
    '6.2.0',
    '6.1',
    '6.0',
    '5.19',
    '5.18',
    '5.17',
    '5.16',
    '5.15',
    '5.14',
    '5.13',
    '5.12',
    '5.11',
    '5.10',
    '5.9',
    '5.8',
    '5.7',
    '5.6',
    '5.5',
    '5.4',
    '5.3',
    '5.2',
    '5.1',
    '5.0',
    '4.26',
    '4.25',
    '4.24',
    '4.23',
    '4.22',
    '4.21',
    '4.20',
    '4.19',
    '4.18',
    '4.17',
  ] as const,
  aliases: [] as const,
}

export type StraceioPackage = typeof straceioPackage
