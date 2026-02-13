/**
 * **gleam** - ⭐️ A friendly language for building type-safe, scalable systems!
 *
 * @domain `gleam.run`
 * @programs `gleam`
 * @version `1.14.0` (47 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gleam.run`
 * @homepage https://gleam.run
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gleamrun
 * console.log(pkg.name)        // "gleam"
 * console.log(pkg.description) // "⭐️ A friendly language for building type-safe, ..."
 * console.log(pkg.programs)    // ["gleam"]
 * console.log(pkg.versions[0]) // "1.14.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gleam-run.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gleamrunPackage = {
  /**
   * The display name of this package.
   */
  name: 'gleam' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gleam.run' as const,
  /**
   * Brief description of what this package does.
   */
  description: '⭐️ A friendly language for building type-safe, scalable systems!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gleam.run/package.yml' as const,
  homepageUrl: 'https://gleam.run' as const,
  githubUrl: 'https://github.com/gleam-lang/gleam' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gleam.run' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gleam.run -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gleam.run' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gleam',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.0',
    '1.9.1',
    '1.9.0',
    '1.8.1',
    '1.8.0',
    '1.7.0',
    '1.6.3',
    '1.6.2',
    '1.6.1',
    '1.6.0',
    '1.5.1',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.0',
    '1.0.0',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.4',
    '0.32.3',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.0',
    '0.30.5',
    '0.30.4',
    '0.30.3',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.0',
    '0.28.3',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.0',
  ] as const,
  aliases: [] as const,
}

export type GleamrunPackage = typeof gleamrunPackage
