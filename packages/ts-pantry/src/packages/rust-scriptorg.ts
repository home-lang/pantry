/**
 * **rust-script** - Run Rust files and expressions as scripts without any setup or compilation step.
 *
 * @domain `rust-script.org`
 * @programs `rust-script`
 * @version `0.36.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rust-script.org`
 * @homepage https://rust-script.org
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rustscriptorg
 * console.log(pkg.name)        // "rust-script"
 * console.log(pkg.description) // "Run Rust files and expressions as scripts witho..."
 * console.log(pkg.programs)    // ["rust-script"]
 * console.log(pkg.versions[0]) // "0.36.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rust-script-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rustscriptorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'rust-script' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rust-script.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Run Rust files and expressions as scripts without any setup or compilation step.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rust-script.org/package.yml' as const,
  homepageUrl: 'https://rust-script.org' as const,
  githubUrl: 'https://github.com/fornwall/rust-script' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rust-script.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rust-script.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rust-script.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rust-script',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.36.0',
    '0.35.0',
    '0.34.0',
  ] as const,
  aliases: [] as const,
}

export type RustscriptorgPackage = typeof rustscriptorgPackage
