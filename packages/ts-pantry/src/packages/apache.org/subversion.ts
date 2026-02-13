/**
 * **svn** - Version control system designed to be a better CVS
 *
 * @domain `apache.org/subversion`
 * @programs `svn`, `svnadmin`, `svnbench`, `svndumpfilter`, `svnfsfs`, ... (+6 more)
 * @version `1.14.5` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apache.org/subversion`
 * @homepage https://subversion.apache.org/
 * @dependencies `gnu.org/gettext^0.21`, `lz4.org^1`, `openssl.org^1.1`, ... (+8 more)
 * @buildDependencies `swig.org@^4`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apacheorgsubversion
 * console.log(pkg.name)        // "svn"
 * console.log(pkg.description) // "Version control system designed to be a better CVS"
 * console.log(pkg.programs)    // ["svn", "svnadmin", ...]
 * console.log(pkg.versions[0]) // "1.14.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apache-org/subversion.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apacheorgsubversionPackage = {
  /**
   * The display name of this package.
   */
  name: 'svn' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apache.org/subversion' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Version control system designed to be a better CVS' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/subversion/package.yml' as const,
  homepageUrl: 'https://subversion.apache.org/' as const,
  githubUrl: 'https://github.com/apache/subversion' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apache.org/subversion' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/subversion -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apache.org/subversion' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'svn',
    'svnadmin',
    'svnbench',
    'svndumpfilter',
    'svnfsfs',
    'svnlook',
    'svnmucc',
    'svnrdump',
    'svnserve',
    'svnsync',
    'svnversion',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gettext^0.21',
    'lz4.org^1',
    'openssl.org^1.1',
    'github.com/JuliaStrings/utf8proc^2',
    'libexpat.github.io^2',
    'kerberos.org^1.20',
    'sqlite.org^3',
    'zlib.net^1.2',
    'apache.org/apr^1',
    'apache.org/apr-util^1',
    'apache.org/serf^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'swig.org@^4',
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.14.5',
    '1.14.4',
    '1.14.3',
    '1.14.2',
  ] as const,
  aliases: [] as const,
}

export type ApacheorgsubversionPackage = typeof apacheorgsubversionPackage
