/**
 * **fx** - Terminal JSON viewer & processor
 *
 * @domain `fx.wtf`
 * @programs `fx`
 * @version `39.2.0` (28 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fx.wtf`
 * @homepage https://fx.wtf
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fxwtf
 * console.log(pkg.name)        // "fx"
 * console.log(pkg.description) // "Terminal JSON viewer & processor"
 * console.log(pkg.programs)    // ["fx"]
 * console.log(pkg.versions[0]) // "39.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fx-wtf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fxwtfPackage = {
  /**
   * The display name of this package.
   */
  name: 'fx' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fx.wtf' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terminal JSON viewer & processor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fx.wtf/package.yml' as const,
  homepageUrl: 'https://fx.wtf' as const,
  githubUrl: 'https://github.com/antonmedv/fx' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fx.wtf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fx.wtf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fx.wtf' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fx',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '39.2.0',
    '39.1.0',
    '39.0.4',
    '39.0.3',
    '39.0.2',
    '39.0.1',
    '39.0.0',
    '38.0.0',
    '37.0.1',
    '37.0.0',
    '36.0.4',
    '36.0.3',
    '36.0.2',
    '36.0.1',
    '36.0.0',
    '35.0.0',
    '34.0.0',
    '33.0.0',
    '32.0.0',
    '31.0.0',
    '30.2.0',
    '30.1.1',
    '30.1.0',
    '30.0.3',
    '30.0.2',
    '30.0.1',
    '30.0.0',
    '24.1.0',
  ] as const,
  aliases: [] as const,
}

export type FxwtfPackage = typeof fxwtfPackage
