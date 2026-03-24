/**
 * **xplr** - A hackable, minimal, fast TUI file explorer
 *
 * @domain `xplr.dev`
 * @programs `xplr`
 * @version `1.1.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install xplr.dev`
 * @homepage https://xplr.dev
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.xplrdev
 * console.log(pkg.name)        // "xplr"
 * console.log(pkg.description) // "A hackable, minimal, fast TUI file explorer"
 * console.log(pkg.programs)    // ["xplr"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/xplr-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const xplrdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'xplr' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'xplr.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A hackable, minimal, fast TUI file explorer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xplr.dev/package.yml' as const,
  homepageUrl: 'https://xplr.dev' as const,
  githubUrl: 'https://github.com/sayanarijit/xplr' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install xplr.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xplr.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install xplr.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xplr',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.21.10',
    '0.21.9',
    '0.21.8',
    '0.21.7',
    '0.21.5',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.4',
    '0.19.3',
    '0.19.2',
    '0.19.1',
    '0.19.0',
    '0.18.0',
    '0.17.6',
    '0.17.4',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.4',
    '0.16.3',
    '0.15.2',
    '0.15.0',
    '0.14.7',
    '0.14.6',
    '0.14.5',
    '0.14.4',
    '0.14.3',
    '0.14.2',
    '0.14.1',
    '0.14.0',
    '0.13.7',
    '0.13.6',
    '0.13.5',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.1',
  ] as const,
  aliases: [] as const,
}

export type XplrdevPackage = typeof xplrdevPackage
