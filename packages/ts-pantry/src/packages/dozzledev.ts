/**
 * **dozzle** - Realtime log viewer for docker containers.
 *
 * @domain `dozzle.dev`
 * @programs `dozzle`
 * @version `10.2.0` (102 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install dozzle.dev`
 * @homepage https://dozzle.dev/
 * @buildDependencies `go.dev@=1.25.7`, `pnpm.io`, `openssl.org`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.dozzledev
 * console.log(pkg.name)        // "dozzle"
 * console.log(pkg.description) // "Realtime log viewer for docker containers. "
 * console.log(pkg.programs)    // ["dozzle"]
 * console.log(pkg.versions[0]) // "10.2.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/dozzle-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const dozzledevPackage = {
  /**
  * The display name of this package.
  */
  name: 'dozzle' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dozzle.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Realtime log viewer for docker containers. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dozzle.dev/package.yml' as const,
  homepageUrl: 'https://dozzle.dev/' as const,
  githubUrl: 'https://github.com/amir20/dozzle' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install dozzle.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dozzle.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install dozzle.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dozzle',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@=1.25.7',
    'pnpm.io',
    'openssl.org',
    'protobuf.dev',
    'abseil.io@20250127',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '10.2.0',
    '10.1.2',
    '10.1.1',
    '10.1.0',
    '10.0.7',
    '10.0.6',
    '10.0.5',
    '10.0.4',
    '10.0.3',
    '10.0.2',
    '10.0.1',
    '10.0.0',
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.14.12',
    '8.14.11',
    '8.14.10',
    '8.14.9',
  ] as const,
  aliases: [] as const,
}

export type DozzledevPackage = typeof dozzledevPackage
