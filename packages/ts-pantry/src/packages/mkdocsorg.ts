/**
 * **mkdocs** - Project documentation with Markdown.
 *
 * @domain `mkdocs.org`
 * @programs `mkdocs`
 * @version `1.6.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mkdocs.org`
 * @homepage https://www.mkdocs.org
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mkdocsorg
 * console.log(pkg.name)        // "mkdocs"
 * console.log(pkg.description) // "Project documentation with Markdown."
 * console.log(pkg.programs)    // ["mkdocs"]
 * console.log(pkg.versions[0]) // "1.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mkdocs-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mkdocsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'mkdocs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mkdocs.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Project documentation with Markdown.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mkdocs.org/package.yml' as const,
  homepageUrl: 'https://www.mkdocs.org' as const,
  githubUrl: 'https://github.com/mkdocs/mkdocs' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mkdocs.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mkdocs.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mkdocs.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mkdocs',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.1',
    '1.6.0',
    '1.5.3',
  ] as const,
  aliases: [] as const,
}

export type MkdocsorgPackage = typeof mkdocsorgPackage
