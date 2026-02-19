/**
 * **spin** - Spin is the open source developer tool for building and running serverless applications powered by WebAssembly.
 *
 * @domain `fermyon.com/spin`
 * @programs `spin`
 * @version `3.6.1` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fermyon.com/spin`
 * @homepage https://spinroot.com/spin/whatispin.html
 * @buildDependencies `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fermyoncomspin
 * console.log(pkg.name)        // "spin"
 * console.log(pkg.description) // "Spin is the open source developer tool for buil..."
 * console.log(pkg.programs)    // ["spin"]
 * console.log(pkg.versions[0]) // "3.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fermyon-com/spin.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fermyoncomspinPackage = {
  /**
  * The display name of this package.
  */
  name: 'spin' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'fermyon.com/spin' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Spin is the open source developer tool for building and running serverless applications powered by WebAssembly.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fermyon.com/spin/package.yml' as const,
  homepageUrl: 'https://spinroot.com/spin/whatispin.html' as const,
  githubUrl: 'https://github.com/fermyon/spin' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install fermyon.com/spin' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fermyon.com/spin -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fermyon.com/spin' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'spin',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:llvm.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.6.1',
    '3.6.0',
    '3.5.1',
    '3.4.1',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.0',
    '2.7.0',
  ] as const,
  aliases: [] as const,
}

export type FermyoncomspinPackage = typeof fermyoncomspinPackage
