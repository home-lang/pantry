/**
 * **lsof** - pkgx package
 *
 * @domain `github.com/lsof-org/lsof`
 * @version `4.99.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/lsof-org/lsof`
 * @buildDependencies `gnu.org/coreutils`, `gnu.org/make`, `llvm.org`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlsoforglsof
 * console.log(pkg.name)        // "lsof"
 * console.log(pkg.versions[0]) // "4.99.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/lsof-org/lsof.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/lsof-org/lsof' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/lsof-org/lsof -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/lsof-org/lsof' as const,
  programs: [] as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.99.5',
  ] as const,
  aliases: [] as const,
}

export type LsofPackage = typeof lsofPackage
