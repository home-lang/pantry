/**
 * **rist** - Reliable Internet Stream Transport (RIST)
 *
 * @domain `code.videolan.org/rist/librist`
 * @programs `rist2rist`, `ristreceiver`, `ristsender`, `ristsrppasswd`
 * @version `0.2.11` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install code.videolan.org/rist/librist`
 * @homepage https://code.videolan.org/rist/
 * @buildDependencies `mesonbuild.com@>=0.47<1`, `linux:sourceware.org/libffi@3` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.codevideolanorgristlibrist
 * console.log(pkg.name)        // "rist"
 * console.log(pkg.description) // "Reliable Internet Stream Transport (RIST)"
 * console.log(pkg.programs)    // ["rist2rist", "ristreceiver", ...]
 * console.log(pkg.versions[0]) // "0.2.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/code-videolan-org/rist/librist.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const codevideolanorgristlibristPackage = {
  /**
  * The display name of this package.
  */
  name: 'rist' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'code.videolan.org/rist/librist' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Reliable Internet Stream Transport (RIST)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/code.videolan.org/rist/librist/package.yml' as const,
  homepageUrl: 'https://code.videolan.org/rist/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install code.videolan.org/rist/librist' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +code.videolan.org/rist/librist -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install code.videolan.org/rist/librist' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rist2rist',
    'ristreceiver',
    'ristsender',
    'ristsrppasswd',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'mesonbuild.com@>=0.47<1',
    'linux:sourceware.org/libffi@3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.11',
    '0.2.8',
    '0.2.7',
  ] as const,
  aliases: [] as const,
}

export type CodevideolanorgristlibristPackage = typeof codevideolanorgristlibristPackage
