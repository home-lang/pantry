/**
 * **pnp** - Fast, disk space efficient package manager
 *
 * @domain `pnpm.io`
 * @programs `pnpm`, `pnpx`
 * @version `12.12.1` (125 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pnpm.io`
 * @homepage https://pnpm.io/
 * @dependencies `nodejs.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.pnpmio
 * console.log(pkg.name)        // "pnp"
 * console.log(pkg.description) // "Fast, disk space efficient package manager"
 * console.log(pkg.programs)    // ["pnpm", "pnpx"]
 * console.log(pkg.versions[0]) // "12.12.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/pnpm-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pnpm.io' as const,
  pantryInstallCommand: 'pantry install pnpm.io' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '12.12.1',
    '12.12.0',
    '12.11.2',
    '12.11.1',
    '12.11.0',
    '12.10.1',
    '12.10.0',
    '12.9.1',
    '12.9.0',
    '12.8.2',
    '12.8.1',
    '12.8.0',
    '12.7.0',
    '12.6.0',
    '12.5.1',
    '12.5.0',
    '12.4.2',
    '12.4.1',
    '12.4.0',
    '12.3.4',
    '12.3.3',
    '12.3.2',
    '12.3.1',
    '12.3.0',
    '12.2.1',
    '12.2.0',
    '12.1.0',
    '12.0.0',
    '11.28.3',
    '11.28.2',
    '11.28.1',
    '11.28.0',
    '11.27.1',
    '11.27.0',
    '11.26.0',
    '11.25.0',
    '11.24.0',
    '11.23.0',
    '11.22.0',
    '11.21.0',
    '11.20.0',
    '11.19.0',
    '11.18.0',
    '11.17.0',
    '11.16.0',
    '11.15.1',
    '11.15.0',
    '11.14.0',
    '11.13.1',
    '11.13.0',
    '11.12.0',
    '11.11.0',
    '11.10.0',
    '11.9.0',
    '11.8.0',
    '11.7.0',
    '11.6.0',
    '11.5.3',
    '11.5.2',
    '11.5.1',
    '11.5.0',
    '11.4.0',
    '11.3.0',
    '11.2.2',
    '11.2.1',
    '11.2.0',
    '11.1.3',
    '11.1.2',
    '11.1.1',
    '11.1.0',
    '11.0.9',
    '11.0.8',
    '11.0.7',
    '11.0.6',
    '11.0.5',
    '11.0.4',
    '11.0.3',
    '11.0.2',
    '11.0.1',
    '11.0.0',
    '10.34.5',
    '10.34.4',
    '10.34.3',
    '10.34.2',
    '10.34.1',
    '10.34.0',
    '10.33.4',
    '10.33.3',
    '10.33.2',
    '10.33.1',
    '10.33.0',
    '10.32.1',
    '10.32.0',
    '10.31.0',
    '10.30.3',
    '10.30.2',
    '10.30.1',
    '10.30.0',
    '10.29.3',
    '10.29.2',
    '10.29.1',
    '10.28.2',
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
  ] as const,
  aliases: [] as const,
}

export type PnpmioPackage = typeof pnpmioPackage
