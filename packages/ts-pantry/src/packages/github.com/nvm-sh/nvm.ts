/**
 * **nvm-exec** - Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions
 *
 * @domain `github.com/nvm-sh/nvm`
 * @programs `nvm-exec`
 * @version `0.40.3` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nvm-sh/nvm`
 * @dependencies `linux:curl.se` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnvmshnvm
 * console.log(pkg.name)        // "nvm-exec"
 * console.log(pkg.description) // "Node Version Manager - POSIX-compliant bash scr..."
 * console.log(pkg.programs)    // ["nvm-exec"]
 * console.log(pkg.versions[0]) // "0.40.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nvm-sh/nvm.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nvmPackage = {
  /**
   * The display name of this package.
   */
  name: 'nvm-exec' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/nvm-sh/nvm' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nvm-sh/nvm/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nvm-sh/nvm' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/nvm-sh/nvm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nvm-sh/nvm -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nvm-sh/nvm' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nvm-exec',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:curl.se',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.40.3',
    '0.40.2',
    '0.40.1',
    '0.40.0',
    '0.39.7',
    '0.39.6',
    '0.39.5',
  ] as const,
  aliases: [] as const,
}

export type NvmPackage = typeof nvmPackage
