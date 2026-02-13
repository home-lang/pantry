/**
 * **assimp** - The official Open-Asset-Importer-Library Repository. Loads 40+ 3D-file-formats into one unified and clean data structure.
 *
 * @domain `assimp.org`
 * @programs `assimp`
 * @version `6.0.3` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install assimp.org`
 * @homepage https://www.assimp.org/
 * @dependencies `zlib.net`
 * @buildDependencies `gnu.org/make`, `cmake.org`, `darwin:curl.se`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.assimporg
 * console.log(pkg.name)        // "assimp"
 * console.log(pkg.description) // "The official Open-Asset-Importer-Library Reposi..."
 * console.log(pkg.programs)    // ["assimp"]
 * console.log(pkg.versions[0]) // "6.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/assimp-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const assimporgPackage = {
  /**
   * The display name of this package.
   */
  name: 'assimp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'assimp.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The official Open-Asset-Importer-Library Repository. Loads 40+ 3D-file-formats into one unified and clean data structure. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/assimp.org/package.yml' as const,
  homepageUrl: 'https://www.assimp.org/' as const,
  githubUrl: 'https://github.com/assimp/assimp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install assimp.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +assimp.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install assimp.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'assimp',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/make',
    'cmake.org',
    'darwin:curl.se',
    'darwin:gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.0.3',
    '6.0.2',
    '6.0.1',
    '5.4.3',
    '5.4.2',
    '5.4.1',
    '5.4.0',
    '5.3.1',
    '5.3.0',
    '5.2.5',
  ] as const,
  aliases: [] as const,
}

export type AssimporgPackage = typeof assimporgPackage
