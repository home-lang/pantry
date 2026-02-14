/**
 * **itstool** - Translate XML with PO files using W3C Internationalization Tag Set rules
 *
 * @domain `itstool.org`
 * @programs `itstool`
 * @version `2.0.7` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install itstool.org`
 * @homepage https://itstool.org/
 * @dependencies `gnome.org/libxml2`, `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.itstoolorg
 * console.log(pkg.name)        // "itstool"
 * console.log(pkg.description) // "Translate XML with PO files using W3C Internati..."
 * console.log(pkg.programs)    // ["itstool"]
 * console.log(pkg.versions[0]) // "2.0.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/itstool-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const itstoolorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'itstool' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'itstool.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Translate XML with PO files using W3C Internationalization Tag Set rules' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/itstool.org/package.yml' as const,
  homepageUrl: 'https://itstool.org/' as const,
  githubUrl: 'https://github.com/itstool/itstool' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install itstool.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +itstool.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install itstool.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'itstool',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/libxml2',
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.0.7',
  ] as const,
  aliases: [] as const,
}

export type ItstoolorgPackage = typeof itstoolorgPackage
