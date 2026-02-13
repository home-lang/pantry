/**
 * **wasm-pack** - 📦✨ your favorite rust -> wasm workflow tool!
 *
 * @domain `crates.io/wasm-pack`
 * @programs `wasm-pack`
 * @version `0.14.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/wasm-pack`
 * @homepage https://rustwasm.github.io/wasm-pack/
 * @dependencies `rust-lang.org`, `rust-lang.org/cargo`
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiowasmpack
 * console.log(pkg.name)        // "wasm-pack"
 * console.log(pkg.description) // "📦✨ your favorite rust -> wasm workflow tool!"
 * console.log(pkg.programs)    // ["wasm-pack"]
 * console.log(pkg.versions[0]) // "0.14.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/wasm-pack.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiowasmpackPackage = {
  /**
   * The display name of this package.
   */
  name: 'wasm-pack' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/wasm-pack' as const,
  /**
   * Brief description of what this package does.
   */
  description: '📦✨ your favorite rust -> wasm workflow tool!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/wasm-pack/package.yml' as const,
  homepageUrl: 'https://rustwasm.github.io/wasm-pack/' as const,
  githubUrl: 'https://github.com/rustwasm/wasm-pack' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/wasm-pack' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/wasm-pack -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/wasm-pack' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'wasm-pack',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'rust-lang.org',
    'rust-lang.org/cargo',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.14.0',
    '0.13.1',
    '0.13.0',
    '0.12.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiowasmpackPackage = typeof cratesiowasmpackPackage
