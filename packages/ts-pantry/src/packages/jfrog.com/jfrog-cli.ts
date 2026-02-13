/**
 * **jfrog-cli** - JFrog CLI is a client that provides a simple interface that automates access to the JFrog products.
 *
 * @domain `jfrog.com/jfrog-cli`
 * @programs `jf`, `jfrog`
 * @version `2.89.0` (110 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jfrog.com/jfrog-cli`
 * @homepage https://www.jfrog.com/confluence/display/CLI/JFrog+CLI
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jfrogcomjfrogcli
 * console.log(pkg.name)        // "jfrog-cli"
 * console.log(pkg.description) // "JFrog CLI is a client that provides a simple in..."
 * console.log(pkg.programs)    // ["jf", "jfrog"]
 * console.log(pkg.versions[0]) // "2.89.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jfrog-com/jfrog-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jfrogcomjfrogcliPackage = {
  /**
   * The display name of this package.
   */
  name: 'jfrog-cli' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'jfrog.com/jfrog-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'JFrog CLI is a client that provides a simple interface that automates access to the JFrog products.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jfrog.com/jfrog-cli/package.yml' as const,
  homepageUrl: 'https://www.jfrog.com/confluence/display/CLI/JFrog+CLI' as const,
  githubUrl: 'https://github.com/jfrog/jfrog-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jfrog.com/jfrog-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jfrog.com/jfrog-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jfrog.com/jfrog-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jf',
    'jfrog',
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
    '2.89.0',
    '2.88.0',
    '2.87.0',
    '2.86.0',
    '2.85.0',
    '2.84.0',
    '2.83.0',
    '2.82.0',
    '2.81.0',
    '2.80.0',
    '2.79.2',
    '2.79.1',
    '2.79.0',
    '2.78.9',
    '2.78.8',
    '2.78.7',
    '2.78.6',
    '2.78.5',
    '2.78.3',
    '2.78.2',
    '2.78.1',
    '2.78.0',
    '2.77.0',
    '2.76.1',
    '2.76.0',
    '2.75.1',
    '2.75.0',
    '2.74.1',
    '2.74.0',
    '2.73.3',
    '2.73.2',
    '2.73.0',
    '2.72.5',
    '2.72.4',
    '2.72.3',
    '2.72.2',
    '2.72.1',
    '2.72.0',
    '2.71.5',
    '2.71.4',
    '2.71.3',
    '2.71.2',
    '2.71.1',
    '2.71.0',
    '2.70.0',
    '2.69.0',
    '2.68.0',
    '2.67.0',
    '2.66.0',
    '2.65.0',
    '2.64.1',
    '2.64.0',
    '2.63.2',
    '2.63.1',
    '2.63.0',
    '2.62.2',
    '2.62.1',
    '2.62.0',
    '2.61.2',
    '2.61.1',
    '2.61.0',
    '2.60.0',
    '2.59.1',
    '2.59.0',
    '2.58.2',
    '2.58.1',
    '2.57.1',
    '2.57.0',
    '2.56.1',
    '2.56.0',
    '2.55.0',
    '2.54.0',
    '2.53.2',
    '2.53.1',
    '2.52.10',
    '2.52.9',
    '2.52.8',
    '2.52.7',
    '2.52.6',
    '2.52.5',
    '2.52.4',
    '2.52.3',
    '2.52.2',
    '2.52.1',
    '2.52.0',
    '2.51.1',
    '2.51.0',
    '2.50.4',
    '2.50.2',
    '2.50.1',
    '2.50.0',
    '2.49.2',
    '2.49.1',
    '2.49.0',
    '2.48.0',
    '2.47.0',
    '2.46.3',
    '2.46.2',
    '2.46.1',
    '2.46.0',
    '2.45.0',
    '2.44.1',
    '2.44.0',
    '2.43.1',
    '2.43.0',
    '2.42.1',
    '2.42.0',
    '2.41.1',
    '2.41.0',
    '2.40.0',
  ] as const,
  aliases: [] as const,
}

export type JfrogcomjfrogcliPackage = typeof jfrogcomjfrogcliPackage
