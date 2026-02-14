/**
 * **ctags** - A maintained ctags implementation
 *
 * @domain `ctags.io`
 * @programs `ctags`
 * @version `6.2.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ctags.io`
 * @homepage https://ctags.io
 * @dependencies `digip.org/jansson^2`, `pyyaml.org/libyaml^0.2`, `pcre.org/v2^10`, ... (+1 more)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `docutils.org@~0.20`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ctagsio
 * console.log(pkg.name)        // "ctags"
 * console.log(pkg.description) // "A maintained ctags implementation"
 * console.log(pkg.programs)    // ["ctags"]
 * console.log(pkg.versions[0]) // "6.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ctags-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ctagsioPackage = {
  /**
  * The display name of this package.
  */
  name: 'ctags' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ctags.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A maintained ctags implementation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ctags.io/package.yml' as const,
  homepageUrl: 'https://ctags.io' as const,
  githubUrl: 'https://github.com/universal-ctags/ctags' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ctags.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ctags.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ctags.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ctags',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'digip.org/jansson^2',
    'pyyaml.org/libyaml^0.2',
    'pcre.org/v2^10',
    'gnome.org/libxml2~2.13 # 2.14 changes the API',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'docutils.org@~0.20',
    'python.org@>=3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.2.1',
    '6.2.0',
    '6.1.0',
  ] as const,
  aliases: [] as const,
}

export type CtagsioPackage = typeof ctagsioPackage
