/**
 * **sphinx** - Tool to create intelligent and beautiful documentation
 *
 * @domain `sphinx-doc.org`
 * @programs `sphinx-apidoc`, `sphinx-autogen`, `sphinx-build`, `sphinx-quickstart`
 * @version `9.1.0` (48 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sphinx-doc.org`
 * @homepage https://www.sphinx-doc.org/
 * @dependencies `python.org>=3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sphinxdocorg
 * console.log(pkg.name)        // "sphinx"
 * console.log(pkg.description) // "Tool to create intelligent and beautiful docume..."
 * console.log(pkg.programs)    // ["sphinx-apidoc", "sphinx-autogen", ...]
 * console.log(pkg.versions[0]) // "9.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sphinx-doc-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sphinxdocorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'sphinx' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sphinx-doc.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Tool to create intelligent and beautiful documentation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sphinx-doc.org/package.yml' as const,
  homepageUrl: 'https://www.sphinx-doc.org/' as const,
  githubUrl: 'https://github.com/sphinx-doc/sphinx' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sphinx-doc.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sphinx-doc.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sphinx-doc.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sphinx-apidoc',
    'sphinx-autogen',
    'sphinx-build',
    'sphinx-quickstart',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '9.1.0',
    '9.0.4',
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.2.3',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.1.3',
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.4.7',
    '7.4.6',
    '7.4.5',
    '7.4.4',
    '7.4.3',
    '7.4.2',
    '7.4.1',
    '7.4.0',
    '7.3.7',
    '7.3.6',
    '7.3.5',
    '7.3.4',
    '7.3.3',
    '7.3.2',
    '7.3.1',
    '7.3.0',
    '7.2.6',
    '7.2.5',
    '7.2.4',
    '7.2.3',
    '7.2.2',
    '7.2.1',
    '7.2.0',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.1',
    '7.0.0',
    '6.2.1',
    '6.2.0',
    '6.1.3',
  ] as const,
  aliases: [] as const,
}

export type SphinxdocorgPackage = typeof sphinxdocorgPackage
