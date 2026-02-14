/**
 * **intltool** - String tool
 *
 * @domain `freedesktop.org/intltool`
 * @programs `intltool-extract`, `intltool-merge`, `intltool-prepare`, `intltool-update`, `intltoolize`, ... (+4 more)
 * @version `0.51.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/intltool`
 * @homepage https://wiki.freedesktop.org/www/Software/intltool
 * @dependencies `perl.org~5`, `linux:libexpat.github.io^2.6` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cpanmin.us` - required only when building from source
 * @companions `PERL5LIB^${{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgintltool
 * console.log(pkg.name)        // "intltool"
 * console.log(pkg.description) // "String tool"
 * console.log(pkg.programs)    // ["intltool-extract", "intltool-merge", ...]
 * console.log(pkg.versions[0]) // "0.51.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/intltool.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgintltoolPackage = {
  /**
  * The display name of this package.
  */
  name: 'intltool' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/intltool' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'String tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/intltool/package.yml' as const,
  homepageUrl: 'https://wiki.freedesktop.org/www/Software/intltool' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freedesktop.org/intltool' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/intltool -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/intltool' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'intltool-extract',
    'intltool-merge',
    'intltool-prepare',
    'intltool-update',
    'intltoolize',
    'lwp-download',
    'lwp-dump',
    'lwp-mirror',
    'lwp-request',
  ] as const,
  /**
  * Related packages that work well with this package.
  * Consider installing these for enhanced functionality.
  */
  companions: [
    'PERL5LIB^${{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB',
  ] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'perl.org~5',
    'linux:libexpat.github.io^2.6',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cpanmin.us',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.51.0',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgintltoolPackage = typeof freedesktoporgintltoolPackage
