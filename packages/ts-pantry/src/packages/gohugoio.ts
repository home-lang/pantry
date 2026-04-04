/**
 * **hugo** - The world’s fastest framework for building websites.
 *
 * @domain `gohugo.io`
 * @programs `hugo`
 * @version `0.159.0` (157 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gohugo.io`
 * @homepage https://gohugo.io/
 * @buildDependencies `go.dev@~1.22.6` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.gohugoio
 * console.log(pkg.name)        // "hugo"
 * console.log(pkg.description) // "The world’s fastest framework for building webs..."
 * console.log(pkg.programs)    // ["hugo"]
 * console.log(pkg.versions[0]) // "0.159.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/gohugo-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const gohugoioPackage = {
  /**
  * The display name of this package.
  */
  name: 'hugo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gohugo.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The world’s fastest framework for building websites.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gohugo.io/package.yml' as const,
  homepageUrl: 'https://gohugo.io/' as const,
  githubUrl: 'https://github.com/gohugoio/hugo' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install gohugo.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gohugo.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install gohugo.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'hugo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.22.6',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.160.0',
    '0.159.2',
    '0.159.1',
    '0.159.0',
    '0.158.0',
    '0.157.0',
    '0.156.0',
    '0.155.3',
    '0.155.2',
    '0.155.1',
    '0.155.0',
    '0.154.5',
    '0.154.4',
    '0.154.3',
    '0.154.2',
    '0.154.1',
    '0.154.0',
    '0.153.5',
    '0.153.4',
    '0.153.3',
    '0.153.2',
    '0.153.1',
    '0.153.0',
    '0.152.2',
    '0.152.1',
    '0.152.0',
    '0.151.2',
    '0.151.1',
    '0.151.0',
    '0.150.1',
    '0.150.0',
    '0.149.1',
    '0.149.0',
    '0.148.2',
    '0.148.1',
    '0.148.0',
    '0.147.9',
    '0.147.8',
    '0.147.7',
    '0.147.6',
    '0.147.5',
    '0.147.4',
    '0.147.3',
    '0.147.2',
    '0.147.1',
    '0.147.0',
    '0.146.7',
    '0.146.6',
    '0.146.5',
    '0.146.4',
    '0.146.3',
    '0.146.2',
    '0.146.1',
  ] as const,
  aliases: [] as const,
}

export type GohugoioPackage = typeof gohugoioPackage
