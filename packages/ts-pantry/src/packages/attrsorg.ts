/**
 * **attrs** - Python Classes Without Boilerplate
 *
 * @domain `attrs.org`
 * @version `25.4.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install attrs.org`
 * @homepage https://www.attrs.org/
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.attrsorg
 * console.log(pkg.name)        // "attrs"
 * console.log(pkg.description) // "Python Classes Without Boilerplate"
 * console.log(pkg.versions[0]) // "25.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/attrs-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const attrsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'attrs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'attrs.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Python Classes Without Boilerplate' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/attrs.org/package.yml' as const,
  homepageUrl: 'https://www.attrs.org/' as const,
  githubUrl: 'https://github.com/python-attrs/attrs' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install attrs.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +attrs.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install attrs.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '25.4.0',
    '25.3.0',
    '25.2.0',
    '25.1.0',
    '24.3.0',
    '24.2.0',
    '24.1.0',
    '23.2.0',
  ] as const,
  aliases: [] as const,
}

export type AttrsorgPackage = typeof attrsorgPackage
