/**
 * **shellcheck** - ShellCheck, a static analysis tool for shell scripts
 *
 * @domain `shellcheck.net`
 * @programs `shellcheck`
 * @version `0.11.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install shellcheck.net`
 * @homepage https://www.shellcheck.net/
 * @dependencies `sourceware.org/libffi@3`
 * @buildDependencies `haskell.org@~9.8`, `haskell.org/cabal@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.shellchecknet
 * console.log(pkg.name)        // "shellcheck"
 * console.log(pkg.description) // "ShellCheck, a static analysis tool for shell sc..."
 * console.log(pkg.programs)    // ["shellcheck"]
 * console.log(pkg.versions[0]) // "0.11.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/shellcheck-net.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install shellcheck.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +shellcheck.net -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install shellcheck.net' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.0',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.0',
    '0.5.0',
    '0.4.7',
    '0.4.6',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.8',
    '0.3.7',
    '0.3.6',
  ] as const,
  aliases: [] as const,
}

export type ShellchecknetPackage = typeof shellchecknetPackage
