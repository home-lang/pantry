/**
 * **openapi-generator** - OpenAPI Generator allows generation of API client libraries (SDK generation), server stubs, documentation and configuration automatically given an OpenAPI Spec (v2, v3)
 *
 * @domain `openapi-generator.tech`
 * @programs `openapi-generator`
 * @version `7.19.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openapi-generator.tech`
 * @homepage https://openapi-generator.tech/
 * @dependencies `openjdk.org^21`
 * @buildDependencies `maven.apache.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openapigeneratortech
 * console.log(pkg.name)        // "openapi-generator"
 * console.log(pkg.description) // "OpenAPI Generator allows generation of API clie..."
 * console.log(pkg.programs)    // ["openapi-generator"]
 * console.log(pkg.versions[0]) // "7.19.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openapi-generator-tech.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openapigeneratortechPackage = {
  /**
   * The display name of this package.
   */
  name: 'openapi-generator' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openapi-generator.tech' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'OpenAPI Generator allows generation of API client libraries (SDK generation), server stubs, documentation and configuration automatically given an OpenAPI Spec (v2, v3)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openapi-generator.tech/package.yml' as const,
  homepageUrl: 'https://openapi-generator.tech/' as const,
  githubUrl: 'https://github.com/OpenAPITools/openapi-generator' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openapi-generator.tech' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openapi-generator.tech -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openapi-generator.tech' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'openapi-generator',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openjdk.org^21',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'maven.apache.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.19.0',
    '7.18.0',
    '7.17.0',
    '7.16.0',
    '7.15.0',
    '7.14.0',
    '7.13.0',
    '7.12.0',
    '7.11.0',
    '7.10.0',
    '7.9.0',
    '7.8.0',
    '7.7.0',
    '7.6.0',
    '7.5.0',
    '7.4.0',
    '7.3.0',
    '7.2.0',
  ] as const,
  aliases: [] as const,
}

export type OpenapigeneratortechPackage = typeof openapigeneratortechPackage
