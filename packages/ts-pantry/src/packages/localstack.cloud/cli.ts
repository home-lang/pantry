/**
 * **localstack** - The LocalStack CLI packaged using pyinstaller
 *
 * @domain `localstack.cloud/cli`
 * @programs `localstack`
 * @version `4.12.0` (33 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install localstack.cloud/cli`
 * @homepage https://localstack.cloud/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@^3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.localstackcloudcli
 * console.log(pkg.name)        // "localstack"
 * console.log(pkg.description) // "The LocalStack CLI packaged using pyinstaller"
 * console.log(pkg.programs)    // ["localstack"]
 * console.log(pkg.versions[0]) // "4.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/localstack-cloud/cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const localstackcloudcliPackage = {
  /**
   * The display name of this package.
   */
  name: 'localstack' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'localstack.cloud/cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The LocalStack CLI packaged using pyinstaller' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/localstack.cloud/cli/package.yml' as const,
  homepageUrl: 'https://localstack.cloud/' as const,
  githubUrl: 'https://github.com/localstack/localstack-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install localstack.cloud/cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +localstack.cloud/cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install localstack.cloud/cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'localstack',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@^3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.12.0',
    '4.11.1',
    '4.11.0',
    '4.10.0',
    '4.9.2',
    '4.9.1',
    '4.9.0',
    '4.8.1',
    '4.8.0',
    '4.7.0',
    '4.6.0',
    '4.5.0',
    '4.4.0',
    '4.3.0',
    '4.2.0',
    '4.1.1',
    '4.1.0',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.8.1',
    '3.8.0',
    '3.6.0',
    '3.5.0',
    '3.4.0',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.3.2',
  ] as const,
  aliases: [] as const,
}

export type LocalstackcloudcliPackage = typeof localstackcloudcliPackage
