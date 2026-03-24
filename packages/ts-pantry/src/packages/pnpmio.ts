/**
 * **pnp** - Fast, disk space efficient package manager
 *
 * @domain `pnpm.io`
 * @programs `pnpm`, `pnpx`
 * @version `10.32.1` (205 versions available)
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
 * console.log(pkg.versions[0]) // "10.32.1" (latest)
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
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pnpm.io -- $SHELL -i' as const,
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
