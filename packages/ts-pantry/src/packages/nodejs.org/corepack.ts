/**
 * **corepack** - Platform built on V8 to build network applications
 *
 * @domain `nodejs.org/corepack`
 * @programs `corepack`
 * @version `0.34.6` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nodejs.org/corepack`
 * @homepage https://nodejs.org/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nodejsorgcorepack
 * console.log(pkg.name)        // "corepack"
 * console.log(pkg.description) // "Platform built on V8 to build network applications"
 * console.log(pkg.programs)    // ["corepack"]
 * console.log(pkg.versions[0]) // "0.34.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nodejs-org/corepack.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nodejsorgcorepackPackage = {
  /**
  * The display name of this package.
  */
  name: 'corepack' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'nodejs.org/corepack' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Platform built on V8 to build network applications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/corepack/package.yml' as const,
  homepageUrl: 'https://nodejs.org/' as const,
  githubUrl: 'https://github.com/nodejs/node' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install nodejs.org/corepack' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nodejs.org/corepack -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nodejs.org/corepack' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'corepack',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org^20',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.34.6',
    '0.34.5',
    '0.34.4',
    '0.34.3',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.4',
    '0.29.3',
    '0.29.2',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.0',
    '0.26.0',
  ] as const,
  aliases: [] as const,
}

export type NodejsorgcorepackPackage = typeof nodejsorgcorepackPackage
