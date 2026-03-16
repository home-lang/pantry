/**
 * **ijg** - pkgx package
 *
 * @domain `ijg.org`
 * @programs `cjpeg`, `djpeg`, `jpegtran`, `rdjpgcom`, `wrjpgcom`
 * @version `10.0.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ijg.org`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.ijgorg
 * console.log(pkg.name)        // "ijg"
 * console.log(pkg.programs)    // ["cjpeg", "djpeg", ...]
 * console.log(pkg.versions[0]) // "10.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ijg-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const ijgorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'ijg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ijg.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ijg.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ijg.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ijg.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install ijg.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cjpeg',
    'djpeg',
    'jpegtran',
    'rdjpgcom',
    'wrjpgcom',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '10.0.0',
    '9.5.0',
    '9f',
    '9e',
    '8d',
  ] as const,
  aliases: [] as const,
}

export type IjgorgPackage = typeof ijgorgPackage
