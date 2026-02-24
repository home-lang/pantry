/**
 * **gnome-extensions-cli** - Command line tool to manage your Gnome Shell extensions
 *
 * @domain `github.com/essembeh/gnome-extensions-cli`
 * @programs `gnome-extensions-cli`, `gext`
 * @version `0.11.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/essembeh/gnome-extensions-cli`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomessembehgnomeextensionscli
 * console.log(pkg.name)        // "gnome-extensions-cli"
 * console.log(pkg.description) // "Command line tool to manage your Gnome Shell ex..."
 * console.log(pkg.programs)    // ["gnome-extensions-cli", "gext"]
 * console.log(pkg.versions[0]) // "0.11.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/essembeh/gnome-extensions-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeextensionscliPackage = {
  /**
  * The display name of this package.
  */
  name: 'gnome-extensions-cli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/essembeh/gnome-extensions-cli' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command line tool to manage your Gnome Shell extensions' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/essembeh/gnome-extensions-cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/essembeh/gnome-extensions-cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/essembeh/gnome-extensions-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/essembeh/gnome-extensions-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/essembeh/gnome-extensions-cli' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gnome-extensions-cli',
    'gext',
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
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.11.0',
    '0.10.8',
    '0.10.7',
    '0.10.6',
    '0.10.5',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
  ] as const,
  aliases: [] as const,
}

export type GnomeextensionscliPackage = typeof gnomeextensionscliPackage
