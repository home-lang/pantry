/**
 * **packer** - Packer is a tool for creating identical machine images for multiple platforms from a single source configuration.
 *
 * @domain `packer.io`
 * @programs `packer`
 * @version `1.15.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install packer.io`
 * @homepage https://packer.io
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.packerio
 * console.log(pkg.name)        // "packer"
 * console.log(pkg.description) // "Packer is a tool for creating identical machine..."
 * console.log(pkg.programs)    // ["packer"]
 * console.log(pkg.versions[0]) // "1.15.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/packer-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const packerioPackage = {
  /**
  * The display name of this package.
  */
  name: 'packer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'packer.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Packer is a tool for creating identical machine images for multiple platforms from a single source configuration.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/packer.io/package.yml' as const,
  homepageUrl: 'https://packer.io' as const,
  githubUrl: 'https://github.com/hashicorp/packer' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install packer.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +packer.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install packer.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'packer',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.15.0',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.1',
    '1.13.0',
    '1.12.0',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.9.5',
    '1.9.4',
    '1.9.3',
    '1.9.2',
  ] as const,
  aliases: [] as const,
}

export type PackerioPackage = typeof packerioPackage
