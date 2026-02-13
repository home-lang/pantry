/**
 * **perl** - Highly capable, feature-rich programming language
 *
 * @domain `perl.org`
 * @programs `corelist`, `cpan`, `enc2xs`, `encguess`, `h2ph`, ... (+25 more)
 * @version `5.42.0` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install perl.org`
 * @homepage https://www.perl.org/
 * @buildDependencies `linux:llvm.org@<17`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.perlorg
 * console.log(pkg.name)        // "perl"
 * console.log(pkg.description) // "Highly capable, feature-rich programming language"
 * console.log(pkg.programs)    // ["corelist", "cpan", ...]
 * console.log(pkg.versions[0]) // "5.42.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/perl-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const perlorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'perl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'perl.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Highly capable, feature-rich programming language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/perl.org/package.yml' as const,
  homepageUrl: 'https://www.perl.org/' as const,
  githubUrl: 'https://github.com/perl/perl5' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install perl.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +perl.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install perl.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'corelist',
    'cpan',
    'enc2xs',
    'encguess',
    'h2ph',
    'h2xs',
    'instmodsh',
    'json_pp',
    'libnetcfg',
    'perl',
    'perlbug',
    'perldoc',
    'perlivp',
    'perlthanks',
    'piconv',
    'pl2pm',
    'pod2html',
    'pod2man',
    'pod2text',
    'pod2usage',
    'podchecker',
    'prove',
    'ptar',
    'ptardiff',
    'ptargrep',
    'shasum',
    'splain',
    'streamzip',
    'xsubpp',
    'zipdetails',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:llvm.org@<17',
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.42.0',
    '5.40.2',
    '5.40.1',
    '5.40.0',
    '5.38.5',
    '5.38.4',
    '5.38.3',
    '5.38.2',
    '5.38.1',
    '5.38.0',
    '5.36.3',
    '5.36.2',
    '5.36.1',
    '5.36.0',
    '5.34.3',
    '5.34.2',
  ] as const,
  aliases: [] as const,
}

export type PerlorgPackage = typeof perlorgPackage
