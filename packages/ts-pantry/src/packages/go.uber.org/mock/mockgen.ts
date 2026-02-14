/**
 * **mockgen** - GoMock is a mocking framework for the Go programming language.
 *
 * @domain `go.uber.org/mock/mockgen`
 * @programs `mockgen`
 * @version `0.6.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install go.uber.org/mock/mockgen`
 * @dependencies `go.dev^1.20`
 * @buildDependencies `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gouberorgmockmockgen
 * console.log(pkg.name)        // "mockgen"
 * console.log(pkg.description) // "GoMock is a mocking framework for the Go progra..."
 * console.log(pkg.programs)    // ["mockgen"]
 * console.log(pkg.versions[0]) // "0.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/go-uber-org/mock/mockgen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gouberorgmockmockgenPackage = {
  /**
  * The display name of this package.
  */
  name: 'mockgen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'go.uber.org/mock/mockgen' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'GoMock is a mocking framework for the Go programming language.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/go.uber.org/mock/mockgen/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/uber-go/mock' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install go.uber.org/mock/mockgen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +go.uber.org/mock/mockgen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install go.uber.org/mock/mockgen' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mockgen',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'go.dev^1.20',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'goreleaser.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.0',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.0',
    '0.3.0',
  ] as const,
  aliases: [] as const,
}

export type GouberorgmockmockgenPackage = typeof gouberorgmockmockgenPackage
