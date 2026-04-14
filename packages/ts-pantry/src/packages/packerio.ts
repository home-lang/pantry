/**
 * **packer** - Packer is a tool for creating identical machine images for multiple platforms from a single source configuration.
 *
 * @domain `packer.io`
 * @programs `packer`
 * @version `1.15.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install packer.io`
 * @homepage https://packer.io
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.packerio
 * console.log(pkg.name)        // "packer"
 * console.log(pkg.description) // "Packer is a tool for creating identical machine..."
 * console.log(pkg.programs)    // ["packer"]
 * console.log(pkg.versions[0]) // "1.15.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/packer-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install packer.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +packer.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install packer.io' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.15.1',
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
    '1.10.0',
    '1.9.5',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.7',
    '1.8.6',
    '1.8.5',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.10',
    '1.7.9',
    '1.7.8',
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.6',
    '1.6.5',
    '1.6.4',
  ] as const,
  aliases: [] as const,
}

export type PackerioPackage = typeof packerioPackage
