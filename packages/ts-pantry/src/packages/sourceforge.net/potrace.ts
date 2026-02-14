/**
 * **potrace** - Convert bitmaps to vector graphics
 *
 * @domain `sourceforge.net/potrace`
 * @programs `potrace`, `mkbitmap`
 * @version `1.16.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sourceforge.net/potrace`
 * @homepage https://potrace.sourceforge.net/
 * @dependencies `zlib.net^1`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sourceforgenetpotrace
 * console.log(pkg.name)        // "potrace"
 * console.log(pkg.description) // "Convert bitmaps to vector graphics"
 * console.log(pkg.programs)    // ["potrace", "mkbitmap"]
 * console.log(pkg.versions[0]) // "1.16.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sourceforge-net/potrace.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourceforgenetpotracePackage = {
  /**
  * The display name of this package.
  */
  name: 'potrace' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sourceforge.net/potrace' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Convert bitmaps to vector graphics' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/potrace/package.yml' as const,
  homepageUrl: 'https://potrace.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sourceforge.net/potrace' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceforge.net/potrace -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sourceforge.net/potrace' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'potrace',
    'mkbitmap',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.16.0',
  ] as const,
  aliases: [] as const,
}

export type SourceforgenetpotracePackage = typeof sourceforgenetpotracePackage
