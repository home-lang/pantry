/**
 * **gofumpt** - A stricter gofmt
 *
 * @domain `mvdan.cc/gofumpt`
 * @programs `gofumpt`
 * @version `0.9.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mvdan.cc/gofumpt`
 * @homepage https://pkg.go.dev/mvdan.cc/gofumpt
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mvdanccgofumpt
 * console.log(pkg.name)        // "gofumpt"
 * console.log(pkg.description) // "A stricter gofmt"
 * console.log(pkg.programs)    // ["gofumpt"]
 * console.log(pkg.versions[0]) // "0.9.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mvdan-cc/gofumpt.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mvdanccgofumptPackage = {
  /**
   * The display name of this package.
   */
  name: 'gofumpt' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mvdan.cc/gofumpt' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A stricter gofmt' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mvdan.cc/gofumpt/package.yml' as const,
  homepageUrl: 'https://pkg.go.dev/mvdan.cc/gofumpt' as const,
  githubUrl: 'https://github.com/mvdan/gofumpt' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mvdan.cc/gofumpt' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mvdan.cc/gofumpt -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mvdan.cc/gofumpt' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gofumpt',
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.0',
    '0.7.0',
  ] as const,
  aliases: [] as const,
}

export type MvdanccgofumptPackage = typeof mvdanccgofumptPackage
