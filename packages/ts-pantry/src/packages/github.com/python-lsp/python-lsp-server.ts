/**
 * **pylsp** - Fork of the python-language-server project, maintained by the Spyder IDE team and the community
 *
 * @domain `github.com/python-lsp/python-lsp-server`
 * @programs `pylsp`
 * @version `1.14.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/python-lsp/python-lsp-server`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompythonlsppythonlspserver
 * console.log(pkg.name)        // "pylsp"
 * console.log(pkg.description) // "Fork of the python-language-server project, mai..."
 * console.log(pkg.programs)    // ["pylsp"]
 * console.log(pkg.versions[0]) // "1.14.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/python-lsp/python-lsp-server.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pythonlspserverPackage = {
  /**
  * The display name of this package.
  */
  name: 'pylsp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/python-lsp/python-lsp-server' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Fork of the python-language-server project, maintained by the Spyder IDE team and the community' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/python-lsp/python-lsp-server/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/python-lsp/python-lsp-server' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/python-lsp/python-lsp-server' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/python-lsp/python-lsp-server -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/python-lsp/python-lsp-server' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pylsp',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@>=3<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.14.0',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.0',
    '1.10.1',
    '1.10.0',
    '1.9.0',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.4',
    '1.7.3',
    '1.7.2',
  ] as const,
  aliases: [] as const,
}

export type PythonlspserverPackage = typeof pythonlspserverPackage
