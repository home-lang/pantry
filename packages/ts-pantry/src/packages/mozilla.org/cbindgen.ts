/**
 * **cbindgen** - A project for generating C bindings from Rust code
 *
 * @domain `mozilla.org/cbindgen`
 * @programs `cbindgen`
 * @version `0.29.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mozilla.org/cbindgen`
 * @dependencies `linux:llvm.org` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mozillaorgcbindgen
 * console.log(pkg.name)        // "cbindgen"
 * console.log(pkg.description) // "A project for generating C bindings from Rust code"
 * console.log(pkg.programs)    // ["cbindgen"]
 * console.log(pkg.versions[0]) // "0.29.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mozilla-org/cbindgen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mozillaorgcbindgenPackage = {
  /**
  * The display name of this package.
  */
  name: 'cbindgen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mozilla.org/cbindgen' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A project for generating C bindings from Rust code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/cbindgen/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mozilla/cbindgen' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mozilla.org/cbindgen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mozilla.org/cbindgen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mozilla.org/cbindgen' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cbindgen',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:llvm.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.29.0',
    '0.28.0',
    '0.27.0',
    '0.26.0',
  ] as const,
  aliases: [] as const,
}

export type MozillaorgcbindgenPackage = typeof mozillaorgcbindgenPackage
