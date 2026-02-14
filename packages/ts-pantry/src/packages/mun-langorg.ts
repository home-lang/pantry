/**
 * **mun** - Source code for the Mun language and runtime.
 *
 * @domain `mun-lang.org`
 * @programs `mun`
 * @version `0.5.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mun-lang.org`
 * @homepage https://mun-lang.org
 * @dependencies `invisible-island.net/ncurses@6`, `sourceware.org/libffi@3`, `gnome.org/libxml2@2`
 * @buildDependencies `llvm.org@^14` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.munlangorg
 * console.log(pkg.name)        // "mun"
 * console.log(pkg.description) // "Source code for the Mun language and runtime."
 * console.log(pkg.programs)    // ["mun"]
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mun-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const munlangorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'mun' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mun-lang.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Source code for the Mun language and runtime.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mun-lang.org/package.yml' as const,
  homepageUrl: 'https://mun-lang.org' as const,
  githubUrl: 'https://github.com/mun-lang/mun' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mun-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mun-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mun-lang.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mun',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'invisible-island.net/ncurses@6',
    'sourceware.org/libffi@3',
    'gnome.org/libxml2@2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'llvm.org@^14',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type MunlangorgPackage = typeof munlangorgPackage
