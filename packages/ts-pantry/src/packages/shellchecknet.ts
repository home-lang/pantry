/**
 * **shellcheck** - ShellCheck, a static analysis tool for shell scripts
 *
 * @domain `shellcheck.net`
 * @programs `shellcheck`
 * @version `0.11.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install shellcheck.net`
 * @homepage https://www.shellcheck.net/
 * @dependencies `sourceware.org/libffi@3`
 * @buildDependencies `haskell.org@~9.8`, `haskell.org/cabal@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.shellchecknet
 * console.log(pkg.name)        // "shellcheck"
 * console.log(pkg.description) // "ShellCheck, a static analysis tool for shell sc..."
 * console.log(pkg.programs)    // ["shellcheck"]
 * console.log(pkg.versions[0]) // "0.11.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/shellcheck-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const shellchecknetPackage = {
  /**
   * The display name of this package.
   */
  name: 'shellcheck' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'shellcheck.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'ShellCheck, a static analysis tool for shell scripts' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/shellcheck.net/package.yml' as const,
  homepageUrl: 'https://www.shellcheck.net/' as const,
  githubUrl: 'https://github.com/koalaman/shellcheck' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install shellcheck.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +shellcheck.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install shellcheck.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'shellcheck',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'sourceware.org/libffi@3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'haskell.org@~9.8',
    'haskell.org/cabal@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type ShellchecknetPackage = typeof shellchecknetPackage
