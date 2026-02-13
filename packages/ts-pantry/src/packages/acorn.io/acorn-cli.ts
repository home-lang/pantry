/**
 * **acorn** - A simple application deployment framework built on Kubernetes
 *
 * @domain `acorn.io/acorn-cli`
 * @programs `acorn`
 * @version `0.10.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install acorn.io/acorn-cli`
 * @homepage https://docs.acorn.io/
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.acornioacorncli
 * console.log(pkg.name)        // "acorn"
 * console.log(pkg.description) // "A simple application deployment framework built..."
 * console.log(pkg.programs)    // ["acorn"]
 * console.log(pkg.versions[0]) // "0.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/acorn-io/acorn-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const acornioacorncliPackage = {
  /**
   * The display name of this package.
   */
  name: 'acorn' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'acorn.io/acorn-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A simple application deployment framework built on Kubernetes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/acorn.io/acorn-cli/package.yml' as const,
  homepageUrl: 'https://docs.acorn.io/' as const,
  githubUrl: 'https://github.com/acorn-io/runtime' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install acorn.io/acorn-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +acorn.io/acorn-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install acorn.io/acorn-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'acorn',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.1',
    '0.10.0',
    '0.9.2',
  ] as const,
  aliases: [] as const,
}

export type AcornioacorncliPackage = typeof acornioacorncliPackage
