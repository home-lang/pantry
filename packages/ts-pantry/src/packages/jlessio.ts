/**
 * **jless** - jless is a command-line JSON viewer designed for reading, exploring, and searching through JSON data.
 *
 * @domain `jless.io`
 * @programs `jless`
 * @version `0.9.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jless.io`
 * @homepage https://jless.io/
 * @dependencies `linux:x.org/xcb@1` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `python.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jlessio
 * console.log(pkg.name)        // "jless"
 * console.log(pkg.description) // "jless is a command-line JSON viewer designed fo..."
 * console.log(pkg.programs)    // ["jless"]
 * console.log(pkg.versions[0]) // "0.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jless-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jlessioPackage = {
  /**
  * The display name of this package.
  */
  name: 'jless' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'jless.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'jless is a command-line JSON viewer designed for reading, exploring, and searching through JSON data.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jless.io/package.yml' as const,
  homepageUrl: 'https://jless.io/' as const,
  githubUrl: 'https://github.com/PaulJuliusMartinez/jless' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install jless.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jless.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jless.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'jless',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:x.org/xcb@1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type JlessioPackage = typeof jlessioPackage
