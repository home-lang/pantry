/**
 * **asciidoc** - Formatter/translator for text files to numerous formats
 *
 * @domain `github.com/asciidoc-py/asciidoc-py`
 * @programs `asciidoc`
 * @version `10.2.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/asciidoc-py/asciidoc-py`
 * @homepage https://asciidoc-py.github.io/
 * @dependencies `docbook.org`, `python.org~3.11`, `gnu.org/source-highlight`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomasciidocpyasciidocpy
 * console.log(pkg.name)        // "asciidoc"
 * console.log(pkg.description) // "Formatter/translator for text files to numerous..."
 * console.log(pkg.programs)    // ["asciidoc"]
 * console.log(pkg.versions[0]) // "10.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/asciidoc-py/asciidoc-py.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const asciidocpyPackage = {
  /**
   * The display name of this package.
   */
  name: 'asciidoc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/asciidoc-py/asciidoc-py' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Formatter/translator for text files to numerous formats' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/asciidoc-py/asciidoc-py/package.yml' as const,
  homepageUrl: 'https://asciidoc-py.github.io/' as const,
  githubUrl: 'https://github.com/asciidoc-py/asciidoc-py' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/asciidoc-py/asciidoc-py' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/asciidoc-py/asciidoc-py -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/asciidoc-py/asciidoc-py' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'asciidoc',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'docbook.org',
    'python.org~3.11',
    'gnu.org/source-highlight',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '10.2.1',
    '10.2.0',
  ] as const,
  aliases: [] as const,
}

export type AsciidocpyPackage = typeof asciidocpyPackage
