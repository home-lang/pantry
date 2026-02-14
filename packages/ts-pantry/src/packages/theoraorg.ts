/**
 * **theora** - pkgx package
 *
 * @domain `theora.org`
 * @version `1.2.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install theora.org`
 * @dependencies `xiph.org/ogg`, `xiph.org/vorbis`
 * @buildDependencies `gnu.org/libtool`, `gnu.org/automake`, `gnu.org/autoconf@>=2.71`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.theoraorg
 * console.log(pkg.name)        // "theora"
 * console.log(pkg.versions[0]) // "1.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/theora-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const theoraorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'theora' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'theora.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/theora.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install theora.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +theora.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install theora.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'xiph.org/ogg',
    'xiph.org/vorbis',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/libtool',
    'gnu.org/automake',
    'gnu.org/autoconf@>=2.71',
    'gnu.org/wget',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.0',
    '1.1.1',
  ] as const,
  aliases: [] as const,
}

export type TheoraorgPackage = typeof theoraorgPackage
