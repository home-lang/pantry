/**
 * **nixpacks** - App source + Nix packages + Docker = Image
 *
 * @domain `nixpacks.com`
 * @programs `nixpacks`
 * @version `1.41.0` (35 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nixpacks.com`
 * @homepage https://nixpacks.com/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nixpackscom
 * console.log(pkg.name)        // "nixpacks"
 * console.log(pkg.description) // "App source + Nix packages + Docker = Image"
 * console.log(pkg.programs)    // ["nixpacks"]
 * console.log(pkg.versions[0]) // "1.41.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nixpacks-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nixpackscomPackage = {
  /**
   * The display name of this package.
   */
  name: 'nixpacks' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'nixpacks.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'App source + Nix packages + Docker = Image' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nixpacks.com/package.yml' as const,
  homepageUrl: 'https://nixpacks.com/' as const,
  githubUrl: 'https://github.com/railwayapp/nixpacks' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install nixpacks.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nixpacks.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nixpacks.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nixpacks',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.41.0',
    '1.40.0',
    '1.39.0',
    '1.38.0',
    '1.37.0',
    '1.36.0',
    '1.35.0',
    '1.34.1',
    '1.34.0',
    '1.33.0',
    '1.32.0',
    '1.31.0',
    '1.30.0',
    '1.29.1',
    '1.29.0',
    '1.28.1',
    '1.28.0',
    '1.27.1',
    '1.27.0',
    '1.26.1',
    '1.26.0',
    '1.25.0',
    '1.24.6',
    '1.24.5',
    '1.24.4',
    '1.24.3',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.0',
    '1.22.0',
    '1.21.3',
    '1.21.2',
    '1.21.1',
    '1.21.0',
  ] as const,
  aliases: [] as const,
}

export type NixpackscomPackage = typeof nixpackscomPackage
