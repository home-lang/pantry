/**
 * **pnp** - Fast, disk space efficient package manager
 *
 * @domain `pnpm.io`
 * @programs `pnpm`, `pnpx`
 * @version `10.28.1` (194 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pnpm.io`
 * @homepage https://pnpm.io/
 * @dependencies `nodejs.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pnpmio
 * console.log(pkg.name)        // "pnp"
 * console.log(pkg.description) // "Fast, disk space efficient package manager"
 * console.log(pkg.programs)    // ["pnpm", "pnpx"]
 * console.log(pkg.versions[0]) // "10.28.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pnpm-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pnpmioPackage = {
  /**
   * The display name of this package.
   */
  name: 'pnp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pnpm.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fast, disk space efficient package manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pnpm.io/package.yml' as const,
  homepageUrl: 'https://pnpm.io/' as const,
  githubUrl: 'https://github.com/pnpm/pnpm' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pnpm.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pnpm.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pnpm.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pnpm',
    'pnpx',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '10.28.1',
    '10.28.0',
    '10.27.0',
    '10.26.2',
    '10.26.1',
    '10.26.0',
    '10.25.0',
    '10.24.0',
    '10.23.0',
    '10.22.0',
    '10.21.0',
    '10.20.0',
    '10.19.0',
    '10.18.3',
    '10.18.2',
    '10.18.1',
    '10.18.0',
    '10.17.1',
    '10.17.0',
    '10.16.1',
    '10.16.0',
    '10.15.1',
    '10.15.0',
    '10.14.0',
    '10.13.1',
    '10.13.0',
    '10.12.4',
    '10.12.3',
    '10.12.2',
    '10.12.1',
    '10.12.0',
    '10.11.1',
    '10.11.0',
    '10.10.0',
    '10.9.0',
    '10.8.1',
    '10.8.0',
    '10.7.1',
    '10.7.0',
    '10.6.5',
    '10.6.4',
    '10.6.3',
    '10.6.2',
    '10.6.1',
    '10.6.0',
    '10.5.2',
    '10.5.1',
    '10.5.0',
    '10.4.1',
    '10.4.0',
    '10.3.0',
    '10.2.1',
    '10.2.0',
    '10.1.0',
    '10.0.0',
    '9.15.9',
    '9.15.8',
    '9.15.7',
    '9.15.6',
    '9.15.5',
    '9.15.4',
    '9.15.3',
    '9.15.2',
    '9.15.1',
    '9.15.0',
    '9.14.4',
    '9.14.3',
    '9.14.2',
    '9.14.1',
    '9.13.2',
    '9.13.1',
    '9.13.0',
    '9.12.3',
    '9.12.2',
    '9.12.1',
    '9.12.0',
    '9.11.0',
    '9.10.0',
    '9.9.0',
    '9.8.0',
    '9.7.1',
    '9.7.0',
    '9.6.0',
    '9.5.0',
    '9.4.0',
    '9.3.0',
    '9.2.0',
    '9.1.4',
    '9.1.3',
    '9.1.2',
    '9.1.1',
    '9.1.0',
    '9.0.6',
    '9.0.5',
    '9.0.4',
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.15.9',
    '8.15.8',
    '8.15.7',
    '8.15.6',
    '8.15.5',
    '8.15.4',
    '8.15.3',
    '8.15.2',
    '8.15.1',
    '8.15.0',
    '8.14.3',
    '8.14.2',
    '8.14.1',
    '8.14.0',
    '8.13.1',
    '8.12.1',
    '8.12.0',
    '8.11.0',
    '8.10.5',
    '8.10.4',
    '8.10.3',
    '8.10.2',
    '8.10.1',
    '8.10.0',
    '8.9.2',
    '8.9.1',
    '8.9.0',
    '8.8.0',
    '8.7.6',
    '8.7.5',
    '8.7.4',
    '8.7.3',
    '8.7.1',
    '8.7.0',
    '8.6.12',
    '8.6.11',
    '8.6.10',
    '8.6.9',
    '8.6.8',
    '8.6.7',
    '8.6.6',
    '8.6.5',
    '8.6.4',
    '8.6.3',
    '8.6.2',
    '8.6.1',
    '8.6.0',
    '8.5.1',
    '8.5.0',
    '8.4.0',
    '8.3.1',
    '8.3.0',
    '8.2.0',
    '8.1.1',
    '8.1.0',
    '8.0.0',
    '7.33.7',
    '7.33.6',
    '7.33.5',
    '7.33.4',
    '7.33.3',
    '7.33.2',
    '7.33.1',
    '7.33.0',
    '7.32.5',
    '7.32.4',
    '7.32.3',
    '7.32.2',
    '7.32.1',
    '7.32.0',
    '7.31.0',
    '7.30.5',
    '7.30.3',
    '7.30.1',
    '7.30.0',
    '7.29.3',
    '7.29.1',
    '7.29.0',
    '7.28.0',
    '7.27.1',
    '7.27.0',
    '7.26.3',
    '7.26.2',
    '7.26.1',
    '7.26.0',
    '7.25.1',
    '7.25.0',
    '7.24.3',
    '7.24.2',
    '7.23.0',
    '7.22.0',
    '7.21.0',
    '7.20.0',
    '7.19.0',
    '7.18.2',
  ] as const,
  aliases: [] as const,
}

export type PnpmioPackage = typeof pnpmioPackage
