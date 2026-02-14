/**
 * **gr2fonttest** - Graphite is a "smart font" system developed specifically to handle the complexities of lesser-known languages of the world.
 *
 * @domain `graphite.sil.org`
 * @programs `gr2fonttest`
 * @version `1.3.14` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install graphite.sil.org`
 * @homepage https://graphite.sil.org/
 * @buildDependencies `cmake.org@^3`, `freetype.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.graphitesilorg
 * console.log(pkg.name)        // "gr2fonttest"
 * console.log(pkg.description) // "Graphite is a "smart font" system developed spe..."
 * console.log(pkg.programs)    // ["gr2fonttest"]
 * console.log(pkg.versions[0]) // "1.3.14" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/graphite-sil-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const graphitesilorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'gr2fonttest' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'graphite.sil.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Graphite is a "smart font" system developed specifically to handle the complexities of lesser-known languages of the world.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/graphite.sil.org/package.yml' as const,
  homepageUrl: 'https://graphite.sil.org/' as const,
  githubUrl: 'https://github.com/silnrsi/graphite' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install graphite.sil.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +graphite.sil.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install graphite.sil.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gr2fonttest',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
    'freetype.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.14',
  ] as const,
  aliases: [] as const,
}

export type GraphitesilorgPackage = typeof graphitesilorgPackage
