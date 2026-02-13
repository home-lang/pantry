/**
 * **deno** - A modern runtime for JavaScript and TypeScript.
 *
 * @domain `deno.land`
 * @programs `deno`
 * @version `2.6.6` (156 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install deno.land`
 * @homepage https://deno.com/
 * @buildDependencies `llvm.org`, `curl.se`, `cmake.org@^3`, ... (+4 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.denoland
 * console.log(pkg.name)        // "deno"
 * console.log(pkg.description) // "A modern runtime for JavaScript and TypeScript."
 * console.log(pkg.programs)    // ["deno"]
 * console.log(pkg.versions[0]) // "2.6.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/deno-land.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const denolandPackage = {
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install deno.land' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +deno.land -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install deno.land' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.6.6',
    '2.6.5',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
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
    '2.2.15',
    '2.2.14',
    '2.2.13',
    '2.2.12',
    '2.2.11',
    '2.2.10',
    '2.2.9',
    '2.2.8',
    '2.2.7',
    '2.2.6',
    '2.2.5',
    '2.2.4',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.14',
    '2.1.13',
    '2.1.12',
    '2.1.11',
    '2.1.10',
    '2.1.9',
    '2.1.8',
    '2.1.7',
    '2.1.6',
    '2.1.5',
    '2.1.4',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.6',
    '2.0.5',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.46.3',
    '1.46.2',
    '1.46.1',
    '1.46.0',
    '1.45.5',
    '1.45.4',
    '1.45.3',
    '1.45.2',
    '1.45.1',
    '1.45.0',
    '1.44.4',
    '1.44.3',
    '1.44.2',
    '1.44.1',
    '1.44.0',
    '1.43.6',
    '1.43.5',
    '1.43.4',
    '1.43.3',
    '1.43.2',
    '1.43.1',
    '1.43.0',
    '1.42.4',
    '1.42.3',
    '1.42.2',
    '1.42.1',
    '1.42.0',
    '1.41.3',
    '1.41.2',
    '1.41.1',
    '1.41.0',
    '1.40.5',
    '1.40.4',
    '1.40.3',
    '1.40.2',
    '1.40.1',
    '1.40.0',
    '1.39.4',
    '1.39.3',
    '1.39.2',
    '1.39.1',
    '1.39.0',
    '1.38.5',
    '1.38.4',
    '1.38.3',
    '1.38.2',
    '1.38.1',
    '1.38.0',
    '1.37.2',
    '1.37.1',
    '1.37.0',
    '1.36.4',
    '1.36.3',
    '1.36.2',
    '1.36.1',
    '1.36.0',
    '1.35.3',
    '1.35.2',
    '1.35.1',
    '1.35.0',
    '1.34.3',
    '1.34.2',
    '1.34.1',
    '1.34.0',
    '1.33.4',
    '1.33.3',
    '1.33.2',
    '1.33.1',
    '1.33.0',
    '1.32.5',
    '1.32.4',
    '1.32.3',
    '1.32.2',
    '1.32.1',
    '1.32.0',
    '1.31.3',
    '1.31.2',
    '1.31.1',
    '1.31.0',
    '1.30.3',
    '1.30.2',
    '1.30.1',
    '1.30.0',
    '1.29.2',
    '1.29.1',
    '1.29.0',
    '1.28.3',
    '1.28.2',
    '1.28.1',
    '1.28.0',
    '1.26.2',
  ] as const,
  aliases: [] as const,
}

export type DenolandPackage = typeof denolandPackage
