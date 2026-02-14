/**
 * **md2html** - C Markdown parser. Fast. SAX-like interface. Compliant to CommonMark specification.
 *
 * @domain `github.com/mity/md4c`
 * @programs `md2html`
 * @version `0.5.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mity/md4c`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommitymd4c
 * console.log(pkg.name)        // "md2html"
 * console.log(pkg.description) // "C Markdown parser. Fast. SAX-like interface. Co..."
 * console.log(pkg.programs)    // ["md2html"]
 * console.log(pkg.versions[0]) // "0.5.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mity/md4c.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const md4cPackage = {
  /**
  * The display name of this package.
  */
  name: 'md2html' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/mity/md4c' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'C Markdown parser. Fast. SAX-like interface. Compliant to CommonMark specification.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mity/md4c/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mity/md4c' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/mity/md4c' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mity/md4c -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mity/md4c' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'md2html',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.8',
  ] as const,
  aliases: [] as const,
}

export type Md4cPackage = typeof md4cPackage
