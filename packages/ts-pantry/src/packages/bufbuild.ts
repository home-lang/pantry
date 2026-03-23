/**
 * **buf** - The best way of working with Protocol Buffers.
 *
 * @domain `buf.build`
 * @programs `buf`
 * @version `1.66.1` (58 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install buf.build`
 * @homepage https://buf.build
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.bufbuild
 * console.log(pkg.name)        // "buf"
 * console.log(pkg.description) // "The best way of working with Protocol Buffers."
 * console.log(pkg.programs)    // ["buf"]
 * console.log(pkg.versions[0]) // "1.66.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/buf-build.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const bufbuildPackage = {
  /**
  * The display name of this package.
  */
  name: 'buf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'buf.build' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The best way of working with Protocol Buffers.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/buf.build/package.yml' as const,
  homepageUrl: 'https://buf.build' as const,
  githubUrl: 'https://github.com/bufbuild/buf' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install buf.build' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +buf.build -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install buf.build' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'buf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.66.1',
    '1.66.0',
    '1.65.0',
    '1.64.0',
    '1.63.0',
    '1.62.1',
    '1.62.0',
    '1.61.0',
    '1.60.0',
    '1.59.0',
    '1.58.0',
    '1.57.2',
    '1.57.1',
    '1.57.0',
    '1.56.0',
    '1.55.1',
    '1.55.0',
    '1.54.0',
    '1.53.0',
    '1.52.1',
  ] as const,
  aliases: [] as const,
}

export type BufbuildPackage = typeof bufbuildPackage
