/**
 * **argbash** - Bash argument parsing code generator
 *
 * @domain `argbash.dev`
 * @programs `argbash`, `argbash-init`, `argbash-1to2`
 * @version `2.11.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install argbash.dev`
 * @dependencies `gnu.org/bash>=3`, `gnu.org/autoconf`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.argbashdev
 * console.log(pkg.name)        // "argbash"
 * console.log(pkg.description) // "Bash argument parsing code generator"
 * console.log(pkg.programs)    // ["argbash", "argbash-init", ...]
 * console.log(pkg.versions[0]) // "2.11.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/argbash-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const argbashdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'argbash' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'argbash.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Bash argument parsing code generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/argbash.dev/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/matejak/argbash' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install argbash.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +argbash.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install argbash.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'argbash',
    'argbash-init',
    'argbash-1to2',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/bash>=3',
    'gnu.org/autoconf',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.11.0',
    '2.10.0',
    '2.9.0',
    '2.8.1',
    '2.8.0',
    '2.7.1',
    '2.7.0',
    '2.6.1',
    '2.6.0',
    '2.5.1',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.3',
    '2.2.2',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.0',
    '1.4.2',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type ArgbashdevPackage = typeof argbashdevPackage
