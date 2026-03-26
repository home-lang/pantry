/**
 * **encore** - Open Source Development Platform for building robust type-safe distributed systems with declarative infrastructure
 *
 * @domain `encore.dev`
 * @programs `encore`, `git-remote-encore`
 * @version `1.56.0` (102 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install encore.dev`
 * @homepage https://encore.dev
 * @dependencies `encore.dev/go^1.21`
 * @buildDependencies `go.dev@~1.23.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.encoredev
 * console.log(pkg.name)        // "encore"
 * console.log(pkg.description) // "Open Source Development Platform for building r..."
 * console.log(pkg.programs)    // ["encore", "git-remote-encore"]
 * console.log(pkg.versions[0]) // "1.56.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/encore-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const encoredevPackage = {
  /**
  * The display name of this package.
  */
  name: 'encore' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'encore.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Open Source Development Platform for building robust type-safe distributed systems with declarative infrastructure' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/encore.dev/package.yml' as const,
  homepageUrl: 'https://encore.dev' as const,
  githubUrl: 'https://github.com/encoredev/encore' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install encore.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +encore.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install encore.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'encore',
    'git-remote-encore',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'encore.dev/go^1.21',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.23.3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.56.2',
    '1.56.1',
    '1.56.0',
    '1.55.0',
    '1.54.2',
    '1.54.1',
    '1.54.0',
    '1.53.8',
    '1.53.7',
    '1.53.6',
    '1.53.5',
    '1.53.4',
    '1.53.3',
    '1.53.2',
    '1.53.1',
    '1.53.0',
    '1.52.5',
    '1.52.4',
    '1.52.3',
    '1.52.2',
    '1.52.1',
    '1.51.11',
    '1.51.10',
    '1.51.9',
    '1.51.8',
    '1.51.7',
    '1.51.6',
    '1.51.5',
    '1.51.4',
    '1.51.3',
    '1.51.2',
    '1.50.7',
    '1.50.6',
    '1.50.5',
    '1.50.4',
    '1.50.2',
    '1.50.1',
    '1.50.0',
    '1.49.3',
    '1.49.1',
    '1.49.0',
    '1.48.13',
    '1.48.12',
    '1.48.11',
    '1.48.10',
    '1.48.9',
    '1.48.8',
    '1.48.7',
    '1.48.6',
    '1.48.5',
    '1.48.4',
    '1.48.3',
  ] as const,
  aliases: [] as const,
}

export type EncoredevPackage = typeof encoredevPackage
