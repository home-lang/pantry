/**
 * **pkl-lang** - A configuration as code language with rich validation and tooling.
 *
 * @domain `pkl-lang.org`
 * @programs `jpkl`, `pkl`
 * @version `0.30.2` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pkl-lang.org`
 * @homepage https://pkl-lang.org
 * @buildDependencies `openjdk.org@^21`, `linux:zlib.net@1`, `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pkllangorg
 * console.log(pkg.name)        // "pkl-lang"
 * console.log(pkg.description) // "A configuration as code language with rich vali..."
 * console.log(pkg.programs)    // ["jpkl", "pkl"]
 * console.log(pkg.versions[0]) // "0.30.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pkl-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pkllangorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'pkl-lang' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pkl-lang.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A configuration as code language with rich validation and tooling.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pkl-lang.org/package.yml' as const,
  homepageUrl: 'https://pkl-lang.org' as const,
  githubUrl: 'https://github.com/apple/pkl' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install pkl-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pkl-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pkl-lang.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'jpkl',
    'pkl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'openjdk.org@^21',
    'linux:zlib.net@1',
    'linux:llvm.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.1',
    '0.29.0',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.3',
    '0.25.2',
  ] as const,
  aliases: [] as const,
}

export type PkllangorgPackage = typeof pkllangorgPackage
