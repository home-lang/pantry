/**
 * **XMLStarlet** - XML command-line utilities
 *
 * @domain `sourceforge.net/xmlstar`
 * @programs `xml`, `xmlstarlet`
 * @version `1.6.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sourceforge.net/xmlstar`
 * @homepage https://xmlstar.sourceforge.net/
 * @dependencies `gnome.org/libxslt^1`
 * @buildDependencies `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sourceforgenetxmlstar
 * console.log(pkg.name)        // "XMLStarlet"
 * console.log(pkg.description) // "XML command-line utilities"
 * console.log(pkg.programs)    // ["xml", "xmlstarlet"]
 * console.log(pkg.versions[0]) // "1.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sourceforge-net/xmlstar.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourceforgenetxmlstarPackage = {
  /**
  * The display name of this package.
  */
  name: 'XMLStarlet' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sourceforge.net/xmlstar' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'XML command-line utilities' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/xmlstar/package.yml' as const,
  homepageUrl: 'https://xmlstar.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sourceforge.net/xmlstar' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceforge.net/xmlstar -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sourceforge.net/xmlstar' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xml',
    'xmlstarlet',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/libxslt^1',
  ] as const,
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
    '1.6.1',
  ] as const,
  aliases: [] as const,
}

export type SourceforgenetxmlstarPackage = typeof sourceforgenetxmlstarPackage
