/**
 * **rustup** - The Rust toolchain installer
 *
 * @domain `rust-lang.org/rustup`
 * @programs `rustup`, `rustup-init`
 * @version `1.28.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rust-lang.org/rustup`
 * @homepage https://rust-lang.github.io/rustup/
 * @dependencies `linux:curl.se` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rustlangorgrustup
 * console.log(pkg.name)        // "rustup"
 * console.log(pkg.description) // "The Rust toolchain installer"
 * console.log(pkg.programs)    // ["rustup", "rustup-init"]
 * console.log(pkg.versions[0]) // "1.28.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rust-lang-org/rustup.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rustlangorgrustupPackage = {
  /**
  * The display name of this package.
  */
  name: 'rustup' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rust-lang.org/rustup' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Rust toolchain installer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/rustup/package.yml' as const,
  homepageUrl: 'https://rust-lang.github.io/rustup/' as const,
  githubUrl: 'https://github.com/rust-lang/rustup' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rust-lang.org/rustup' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rust-lang.org/rustup -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rust-lang.org/rustup' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rustup',
    'rustup-init',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:curl.se',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.28.2',
    '1.28.1',
    '1.28.0',
    '1.27.1',
    '1.27.0',
  ] as const,
  aliases: [] as const,
}

export type RustlangorgrustupPackage = typeof rustlangorgrustupPackage
