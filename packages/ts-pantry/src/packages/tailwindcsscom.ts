/**
 * **tailwindcss** - A utility-first CSS framework for rapid UI development.
 *
 * @domain `tailwindcss.com`
 * @programs `tailwindcss`
 * @version `4.1.18` (54 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tailwindcss.com`
 * @homepage https://tailwindcss.com
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tailwindcsscom
 * console.log(pkg.name)        // "tailwindcss"
 * console.log(pkg.description) // "A utility-first CSS framework for rapid UI deve..."
 * console.log(pkg.programs)    // ["tailwindcss"]
 * console.log(pkg.versions[0]) // "4.1.18" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tailwindcss-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tailwindcsscomPackage = {
  /**
   * The display name of this package.
   */
  name: 'tailwindcss' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tailwindcss.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A utility-first CSS framework for rapid UI development.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tailwindcss.com/package.yml' as const,
  homepageUrl: 'https://tailwindcss.com' as const,
  githubUrl: 'https://github.com/tailwindlabs/tailwindcss' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tailwindcss.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tailwindcss.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tailwindcss.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tailwindcss',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.1.18',
    '4.1.17',
    '4.1.16',
    '4.1.15',
    '4.1.14',
    '4.1.13',
    '4.1.12',
    '4.1.11',
    '4.1.10',
    '4.1.9',
    '4.1.8',
    '4.1.7',
    '4.1.6',
    '4.1.5',
    '4.1.4',
    '4.1.3',
    '4.1.2',
    '4.1.1',
    '4.1.0',
    '4.0.17',
    '4.0.16',
    '4.0.15',
    '4.0.14',
    '4.0.13',
    '4.0.12',
    '4.0.11',
    '4.0.10',
    '4.0.9',
    '4.0.8',
    '4.0.7',
    '4.0.6',
    '4.0.5',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.4.19',
    '3.4.18',
    '3.4.17',
    '3.4.16',
    '3.4.15',
    '3.4.14',
    '3.4.13',
    '3.4.12',
    '3.4.11',
    '3.4.10',
    '3.4.9',
    '3.4.8',
    '3.4.7',
    '3.4.6',
    '3.4.5',
    '3.4.4',
    '3.4.3',
  ] as const,
  aliases: [] as const,
}

export type TailwindcsscomPackage = typeof tailwindcsscomPackage
