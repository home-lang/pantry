/**
 * **openplayground** - An LLM playground you can run on your laptop
 *
 * @domain `github.com/nat/openplayground`
 * @programs `openplayground`
 * @version `2023.6.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nat/openplayground`
 * @dependencies `python.org~3.11`, `gnu.org/bash`, `tea.xyz^0`
 * @buildDependencies `npmjs.com`, `pip.pypa.io` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnatopenplayground
 * console.log(pkg.name)        // "openplayground"
 * console.log(pkg.description) // "An LLM playground you can run on your laptop"
 * console.log(pkg.programs)    // ["openplayground"]
 * console.log(pkg.versions[0]) // "2023.6.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nat/openplayground.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openplaygroundPackage = {
  /**
   * The display name of this package.
   */
  name: 'openplayground' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/nat/openplayground' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An LLM playground you can run on your laptop' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nat/openplayground/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nat/openplayground' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/nat/openplayground' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nat/openplayground -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nat/openplayground' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'openplayground',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
    'gnu.org/bash',
    'tea.xyz^0',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com',
    'pip.pypa.io',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2023.6.5',
  ] as const,
  aliases: [] as const,
}

export type OpenplaygroundPackage = typeof openplaygroundPackage
