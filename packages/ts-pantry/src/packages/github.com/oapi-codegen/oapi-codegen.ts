/**
 * **oapi-codegen** - Generate Go client and server boilerplate from OpenAPI 3 specifications
 *
 * @domain `github.com/oapi-codegen/oapi-codegen`
 * @programs `oapi-codegen`
 * @version `2.5.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/oapi-codegen/oapi-codegen`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomoapicodegenoapicodegen
 * console.log(pkg.name)        // "oapi-codegen"
 * console.log(pkg.description) // "Generate Go client and server boilerplate from ..."
 * console.log(pkg.programs)    // ["oapi-codegen"]
 * console.log(pkg.versions[0]) // "2.5.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/oapi-codegen/oapi-codegen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const oapicodegenPackage = {
  /**
   * The display name of this package.
   */
  name: 'oapi-codegen' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/oapi-codegen/oapi-codegen' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generate Go client and server boilerplate from OpenAPI 3 specifications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/oapi-codegen/oapi-codegen/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/oapi-codegen/oapi-codegen' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/oapi-codegen/oapi-codegen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/oapi-codegen/oapi-codegen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/oapi-codegen/oapi-codegen' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'oapi-codegen',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.5.1',
    '2.5.0',
    '2.4.1',
    '2.4.0',
    '2.3.0',
  ] as const,
  aliases: [] as const,
}

export type OapicodegenPackage = typeof oapicodegenPackage
