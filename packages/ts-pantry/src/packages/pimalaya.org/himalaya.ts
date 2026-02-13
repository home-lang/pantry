/**
 * **himalaya** - CLI email client written in Rust
 *
 * @domain `pimalaya.org/himalaya`
 * @programs `himalaya`
 * @version `1.1.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pimalaya.org/himalaya`
 * @homepage https://pimalaya.org
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pimalayaorghimalaya
 * console.log(pkg.name)        // "himalaya"
 * console.log(pkg.description) // "CLI email client written in Rust"
 * console.log(pkg.programs)    // ["himalaya"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pimalaya-org/himalaya.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pimalayaorghimalayaPackage = {
  /**
   * The display name of this package.
   */
  name: 'himalaya' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pimalaya.org/himalaya' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI email client written in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pimalaya.org/himalaya/package.yml' as const,
  homepageUrl: 'https://pimalaya.org' as const,
  githubUrl: 'https://github.com/pimalaya/himalaya' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pimalaya.org/himalaya' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pimalaya.org/himalaya -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pimalaya.org/himalaya' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'himalaya',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.0',
    '1.0.0',
    '0.9.0',
    '0.8.4',
  ] as const,
  aliases: [] as const,
}

export type PimalayaorghimalayaPackage = typeof pimalayaorghimalayaPackage
