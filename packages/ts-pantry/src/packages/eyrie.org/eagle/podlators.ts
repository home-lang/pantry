/**
 * **pod2man** - pkgx package
 *
 * @domain `eyrie.org/eagle/podlators`
 * @programs `pod2man`, `pod2text`
 * @version `5.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install eyrie.org/eagle/podlators`
 * @dependencies `perl.org^5`
 * @buildDependencies `gnu.org/make`, `gnu.org/wget`, `linux:cpanmin.us@^1` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 * @companions `PERL5LIB^{{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.eyrieorgeaglepodlators
 * console.log(pkg.name)        // "pod2man"
 * console.log(pkg.programs)    // ["pod2man", "pod2text"]
 * console.log(pkg.versions[0]) // "5.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/eyrie-org/eagle/podlators.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const eyrieorgeaglepodlatorsPackage = {
  /**
   * The display name of this package.
   */
  name: 'pod2man' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'eyrie.org/eagle/podlators' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/eyrie.org/eagle/podlators/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install eyrie.org/eagle/podlators' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +eyrie.org/eagle/podlators -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install eyrie.org/eagle/podlators' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pod2man',
    'pod2text',
  ] as const,
  /**
   * Related packages that work well with this package.
   * Consider installing these for enhanced functionality.
   */
  companions: [
    'PERL5LIB^{{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB',
  ] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org^5',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/make',
    'gnu.org/wget',
    'linux:cpanmin.us@^1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.0',
  ] as const,
  aliases: [] as const,
}

export type EyrieorgeaglepodlatorsPackage = typeof eyrieorgeaglepodlatorsPackage
