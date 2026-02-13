/**
 * **alpaca.cpp** - Locally run an Instruction-Tuned Chat-Style LLM
 *
 * @domain `github.com/antimatter15/alpaca.cpp`
 * @programs `alpaca.cpp`
 * @version `2023.3.21` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/antimatter15/alpaca.cpp`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomantimatter15alpacacpp
 * console.log(pkg.name)        // "alpaca.cpp"
 * console.log(pkg.description) // "Locally run an Instruction-Tuned Chat-Style LLM "
 * console.log(pkg.programs)    // ["alpaca.cpp"]
 * console.log(pkg.versions[0]) // "2023.3.21" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/antimatter15/alpaca-cpp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const alpacacppPackage = {
  /**
   * The display name of this package.
   */
  name: 'alpaca.cpp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/antimatter15/alpaca.cpp' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Locally run an Instruction-Tuned Chat-Style LLM ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/antimatter15/alpaca.cpp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/antimatter15/alpaca.cpp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/antimatter15/alpaca.cpp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/antimatter15/alpaca.cpp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/antimatter15/alpaca.cpp' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'alpaca.cpp',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2023.3.21',
  ] as const,
  aliases: [] as const,
}

export type AlpacacppPackage = typeof alpacacppPackage
