/**
 * **yamllint** - A linter for YAML files.
 *
 * @domain `github.com/adrienverge/yamllint`
 * @programs `yamllint`
 * @version `1.38.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/adrienverge/yamllint`
 * @dependencies `python.org~3.11`, `pyyaml.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomadrienvergeyamllint
 * console.log(pkg.name)        // "yamllint"
 * console.log(pkg.description) // "A linter for YAML files."
 * console.log(pkg.programs)    // ["yamllint"]
 * console.log(pkg.versions[0]) // "1.38.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/adrienverge/yamllint.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yamllintPackage = {
  /**
   * The display name of this package.
   */
  name: 'yamllint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/adrienverge/yamllint' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A linter for YAML files.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/adrienverge/yamllint/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/adrienverge/yamllint' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/adrienverge/yamllint' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/adrienverge/yamllint -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/adrienverge/yamllint' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'yamllint',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
    'pyyaml.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.38.0',
    '1.37.1',
    '1.37.0',
    '1.36.2',
    '1.36.1',
    '1.36.0',
    '1.35.1',
    '1.35.0',
    '1.34.0',
    '1.33.0',
    '1.32.0',
  ] as const,
  aliases: [] as const,
}

export type YamllintPackage = typeof yamllintPackage
