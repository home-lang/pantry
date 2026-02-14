/**
 * **vamp** - Audio processing plugin system sdk
 *
 * @domain `vamp-plugins.org`
 * @programs `vamp-simple-host`, `vamp-rdf-template-generator`
 * @version `2.10.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install vamp-plugins.org`
 * @homepage https://www.vamp-plugins.org/
 * @dependencies `xiph.org/flac^1.4`, `xiph.org/ogg^1.3`, `github.com/libsndfile/libsndfile^1.2`
 * @buildDependencies `gnu.org/automake`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.vamppluginsorg
 * console.log(pkg.name)        // "vamp"
 * console.log(pkg.description) // "Audio processing plugin system sdk"
 * console.log(pkg.programs)    // ["vamp-simple-host", "vamp-rdf-template-generator"]
 * console.log(pkg.versions[0]) // "2.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/vamp-plugins-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vamppluginsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'vamp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'vamp-plugins.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Audio processing plugin system sdk' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vamp-plugins.org/package.yml' as const,
  homepageUrl: 'https://www.vamp-plugins.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install vamp-plugins.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vamp-plugins.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install vamp-plugins.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'vamp-simple-host',
    'vamp-rdf-template-generator',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'xiph.org/flac^1.4',
    'xiph.org/ogg^1.3',
    'github.com/libsndfile/libsndfile^1.2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/automake',
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.10.0',
    '2.9.0',
  ] as const,
  aliases: [] as const,
}

export type VamppluginsorgPackage = typeof vamppluginsorgPackage
