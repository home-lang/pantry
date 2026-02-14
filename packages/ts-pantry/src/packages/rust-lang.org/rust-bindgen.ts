/**
 * **bindgen** - Automatically generates Rust FFI bindings to C (and some C++) libraries.
 *
 * @domain `rust-lang.org/rust-bindgen`
 * @programs `bindgen`
 * @version `0.72.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rust-lang.org/rust-bindgen`
 * @homepage https://rust-lang.github.io/rust-bindgen/
 * @dependencies `linux:llvm.org` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rustlangorgrustbindgen
 * console.log(pkg.name)        // "bindgen"
 * console.log(pkg.description) // "Automatically generates Rust FFI bindings to C ..."
 * console.log(pkg.programs)    // ["bindgen"]
 * console.log(pkg.versions[0]) // "0.72.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rust-lang-org/rust-bindgen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rustlangorgrustbindgenPackage = {
  /**
  * The display name of this package.
  */
  name: 'bindgen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rust-lang.org/rust-bindgen' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Automatically generates Rust FFI bindings to C (and some C++) libraries.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/rust-bindgen/package.yml' as const,
  homepageUrl: 'https://rust-lang.github.io/rust-bindgen/' as const,
  githubUrl: 'https://github.com/rust-lang/rust-bindgen' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rust-lang.org/rust-bindgen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rust-lang.org/rust-bindgen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rust-lang.org/rust-bindgen' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bindgen',
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
    '0.72.1',
    '0.72.0',
    '0.71.1',
    '0.71.0',
    '0.70.1',
  ] as const,
  aliases: [] as const,
}

export type RustlangorgrustbindgenPackage = typeof rustlangorgrustbindgenPackage
