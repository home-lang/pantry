/**
 * **puzzles** - pkgx package
 *
 * @domain `chiark.greenend.org.uk/puzzles`
 * @version `20251220.0.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install chiark.greenend.org.uk/puzzles`
 * @dependencies `linux:gtk.org/gtk3` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@>=3.5`, `chiark.greenend.org.uk/halibut`, `linux:llvm.org@20`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.chiarkgreenendorgukpuzzles
 * console.log(pkg.name)        // "puzzles"
 * console.log(pkg.versions[0]) // "20251220.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/chiark-greenend-org-uk/puzzles.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const chiarkgreenendorgukpuzzlesPackage = {
  /**
   * The display name of this package.
   */
  name: 'puzzles' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'chiark.greenend.org.uk/puzzles' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/chiark.greenend.org.uk/puzzles/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install chiark.greenend.org.uk/puzzles' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +chiark.greenend.org.uk/puzzles -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install chiark.greenend.org.uk/puzzles' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:gtk.org/gtk3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@>=3.5',
    'chiark.greenend.org.uk/halibut',
    'linux:llvm.org@20',
    'linux:imagemagick.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '20251220.0.0',
    '20251211.0.0',
    '20251127.0.0',
    '20251120.0.0',
    '20251021.0.0',
  ] as const,
  aliases: [] as const,
}

export type ChiarkgreenendorgukpuzzlesPackage = typeof chiarkgreenendorgukpuzzlesPackage
