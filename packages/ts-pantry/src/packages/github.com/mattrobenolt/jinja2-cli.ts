/**
 * **jinja2** - CLI for the Jinja2 templating language
 *
 * @domain `github.com/mattrobenolt/jinja2-cli`
 * @programs `jinja2`
 * @version `1.0.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mattrobenolt/jinja2-cli`
 * @dependencies `python.org>=3.7<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommattrobenoltjinja2cli
 * console.log(pkg.name)        // "jinja2"
 * console.log(pkg.description) // "CLI for the Jinja2 templating language"
 * console.log(pkg.programs)    // ["jinja2"]
 * console.log(pkg.versions[0]) // "1.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mattrobenolt/jinja2-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jinja2cliPackage = {
  /**
   * The display name of this package.
   */
  name: 'jinja2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mattrobenolt/jinja2-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI for the Jinja2 templating language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mattrobenolt/jinja2-cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mattrobenolt/jinja2-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mattrobenolt/jinja2-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mattrobenolt/jinja2-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mattrobenolt/jinja2-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jinja2',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.7<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.0',
    '0.8.2',
  ] as const,
  aliases: [] as const,
}

export type Jinja2cliPackage = typeof jinja2cliPackage
