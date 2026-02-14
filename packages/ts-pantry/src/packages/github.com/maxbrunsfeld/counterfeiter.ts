/**
 * **counterfeiter** - A tool for generating self-contained, type-safe test doubles in go
 *
 * @domain `github.com/maxbrunsfeld/counterfeiter`
 * @programs `counterfeiter`
 * @version `6.12.1` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/maxbrunsfeld/counterfeiter`
 * @dependencies `go.dev`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommaxbrunsfeldcounterfeiter
 * console.log(pkg.name)        // "counterfeiter"
 * console.log(pkg.description) // "A tool for generating self-contained, type-safe..."
 * console.log(pkg.programs)    // ["counterfeiter"]
 * console.log(pkg.versions[0]) // "6.12.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/maxbrunsfeld/counterfeiter.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const counterfeiterPackage = {
  /**
  * The display name of this package.
  */
  name: 'counterfeiter' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/maxbrunsfeld/counterfeiter' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A tool for generating self-contained, type-safe test doubles in go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/maxbrunsfeld/counterfeiter/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/maxbrunsfeld/counterfeiter' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/maxbrunsfeld/counterfeiter' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/maxbrunsfeld/counterfeiter -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/maxbrunsfeld/counterfeiter' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'counterfeiter',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'go.dev',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.12.1',
    '6.12.0',
    '6.11.2',
    '6.11.1',
    '6.11.0',
    '6.10.0',
    '6.9.0',
    '6.8.1',
    '6.8.0',
    '6.7.0',
    '6.6.2',
    '6.6.1',
  ] as const,
  aliases: [] as const,
}

export type CounterfeiterPackage = typeof counterfeiterPackage
