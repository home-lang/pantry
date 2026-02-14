/**
 * **aac-enc** - Standalone library of the Fraunhofer FDK AAC code from Android
 *
 * @domain `sourceforge.net/opencore-amr`
 * @programs `aac-enc`
 * @version `2.0.3` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sourceforge.net/opencore-amr`
 * @homepage https://sourceforge.net/projects/opencore-amr/
 * @buildDependencies `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sourceforgenetopencoreamr
 * console.log(pkg.name)        // "aac-enc"
 * console.log(pkg.description) // "Standalone library of the Fraunhofer FDK AAC co..."
 * console.log(pkg.programs)    // ["aac-enc"]
 * console.log(pkg.versions[0]) // "2.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sourceforge-net/opencore-amr.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourceforgenetopencoreamrPackage = {
  /**
  * The display name of this package.
  */
  name: 'aac-enc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sourceforge.net/opencore-amr' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Standalone library of the Fraunhofer FDK AAC code from Android' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/opencore-amr/package.yml' as const,
  homepageUrl: 'https://sourceforge.net/projects/opencore-amr/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sourceforge.net/opencore-amr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceforge.net/opencore-amr -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sourceforge.net/opencore-amr' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'aac-enc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.0.3',
    '2.0.2',
  ] as const,
  aliases: [] as const,
}

export type SourceforgenetopencoreamrPackage = typeof sourceforgenetopencoreamrPackage
