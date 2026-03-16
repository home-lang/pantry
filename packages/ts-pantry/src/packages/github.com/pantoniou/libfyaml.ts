/**
 * **libfyaml** - pkgx package
 *
 * @domain `github.com/pantoniou/libfyaml`
 * @programs `fy-compose`, `fy-dump`, `fy-filter`, `fy-join`, `fy-testsuite`, ... (+2 more)
 * @version `0.9.5` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/pantoniou/libfyaml`
 * @buildDependencies `linux:gnu.org/m4` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcompantonioulibfyaml
 * console.log(pkg.name)        // "libfyaml"
 * console.log(pkg.programs)    // ["fy-compose", "fy-dump", ...]
 * console.log(pkg.versions[0]) // "0.9.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/pantoniou/libfyaml.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const libfyamlPackage = {
  /**
  * The display name of this package.
  */
  name: 'libfyaml' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/pantoniou/libfyaml' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pantoniou/libfyaml/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/pantoniou/libfyaml' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/pantoniou/libfyaml -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/pantoniou/libfyaml' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'fy-compose',
    'fy-dump',
    'fy-filter',
    'fy-join',
    'fy-testsuite',
    'fy-tool',
    'fy-ypath',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/m4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type LibfyamlPackage = typeof libfyamlPackage
