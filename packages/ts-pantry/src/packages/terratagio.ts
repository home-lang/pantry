/**
 * **terratag** - Terratag is a CLI tool that enables users of Terraform to automatically create and maintain tags across their entire set of AWS, Azure, and GCP resources
 *
 * @domain `terratag.io`
 * @programs `terratag`
 * @version `0.7.6` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install terratag.io`
 * @homepage https://terratag.io
 * @dependencies `terraform.io>=0.12`, `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.terratagio
 * console.log(pkg.name)        // "terratag"
 * console.log(pkg.description) // "Terratag is a CLI tool that enables users of Te..."
 * console.log(pkg.programs)    // ["terratag"]
 * console.log(pkg.versions[0]) // "0.7.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/terratag-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const terratagioPackage = {
  /**
  * The display name of this package.
  */
  name: 'terratag' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'terratag.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Terratag is a CLI tool that enables users of Terraform to automatically create and maintain tags across their entire set of AWS, Azure, and GCP resources' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/terratag.io/package.yml' as const,
  homepageUrl: 'https://terratag.io' as const,
  githubUrl: 'https://github.com/env0/terratag' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install terratag.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +terratag.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install terratag.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'terratag',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'terraform.io>=0.12',
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.7.6',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.1',
    '0.6.0',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.1',
    '0.4.0',
    '0.3.5',
    '0.3.4',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.6',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.50',
    '0.1.49',
    '0.1.48',
    '0.1.47',
    '0.1.46',
    '0.1.45',
    '0.1.44',
    '0.1.43',
    '0.1.42',
    '0.1.41',
    '0.1.40',
    '0.1.37',
    '0.1.36',
    '0.1.35',
    '0.1.34',
    '0.1.33',
    '0.1.32',
    '0.1.31',
    '0.1.30',
    '0.1.29',
    '0.1.28',
    '0.1.27',
  ] as const,
  aliases: [] as const,
}

export type TerratagioPackage = typeof terratagioPackage
