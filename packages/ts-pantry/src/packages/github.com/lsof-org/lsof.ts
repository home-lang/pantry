/**
 * **lsof** - pkgx package
 *
 * @domain `github.com/lsof-org/lsof`
 * @programs `lsof`
 * @version `4.99.6` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/lsof-org/lsof`
 * @buildDependencies `gnu.org/coreutils`, `gnu.org/make`, `llvm.org`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomlsoforglsof
 * console.log(pkg.name)        // "lsof"
 * console.log(pkg.programs)    // ["lsof"]
 * console.log(pkg.versions[0]) // "4.99.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/lsof-org/lsof.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const lsofPackage = {
  /**
  * The display name of this package.
  */
  name: 'lsof' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/lsof-org/lsof' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lsof-org/lsof/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/lsof-org/lsof' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/lsof-org/lsof -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/lsof-org/lsof' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'lsof',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'gnu.org/coreutils',
    'gnu.org/make',
    'llvm.org',
    'linux:gnu.org/binutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.99.6',
    '4.99.5',
  ] as const,
  aliases: [] as const,
}

export type LsofPackage = typeof lsofPackage
