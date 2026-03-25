/**
 * **deno** - A modern runtime for JavaScript and TypeScript.
 *
 * @domain `deno.land`
 * @programs `deno`
 * @version `2.7.7` (169 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install deno.land`
 * @name `deno`
 * @homepage https://deno.com/
 * @buildDependencies `llvm.org`, `curl.se`, `cmake.org@^3`, ... (+4 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access the package
 * const pkg = pantry.deno
 * // Or access via domain
 * const samePkg = pantry.denoland
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "deno"
 * console.log(pkg.description) // "A modern runtime for JavaScript and TypeScript."
 * console.log(pkg.programs)    // ["deno"]
 * console.log(pkg.versions[0]) // "2.7.7" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/deno-land.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const denoPackage = {
  /**
  * The display name of this package.
  */
  name: 'deno' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'deno.land' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A modern runtime for JavaScript and TypeScript.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/deno.land/package.yml' as const,
  homepageUrl: 'https://deno.com/' as const,
  githubUrl: 'https://github.com/denoland/deno' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install deno.land' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +deno.land -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install deno.land' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'deno',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'llvm.org',
    'curl.se',
    'cmake.org@^3',
    'protobuf.dev',
    'github.com/mikefarah/yq@^4',
    'crates.io/semverator@^0',
    'sourceware.org/libffi@>=3.2.1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.7.8',
    '2.7.7',
    '2.7.6',
    '2.7.5',
    '2.7.4',
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.10',
    '2.6.9',
    '2.6.8',
    '2.6.7',
    '2.6.6',
    '2.6.5',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.7',
    '2.5.6',
    '2.5.5',
    '2.5.4',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.7',
    '2.3.6',
    '2.3.5',
    '2.3.4',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.15',
    '2.2.14',
    '2.2.13',
    '2.2.12',
    '2.2.11',
    '2.2.10',
    '2.2.9',
    '2.1.14',
    '2.1.13',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type DenoPackage = typeof denoPackage
