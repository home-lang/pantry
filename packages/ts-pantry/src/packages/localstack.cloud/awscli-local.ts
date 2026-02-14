/**
 * **awslocal** - 💲  "awslocal" - Thin wrapper around the "aws" command line interface for use with LocalStack
 *
 * @domain `localstack.cloud/awscli-local`
 * @programs `awslocal`
 * @version `2023.12.28` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install localstack.cloud/awscli-local`
 * @homepage https://www.localstack.cloud/
 * @dependencies `pkgx.sh>=1`, `aws.amazon.com/cli^2`
 * @buildDependencies `python.org@^3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.localstackcloudawsclilocal
 * console.log(pkg.name)        // "awslocal"
 * console.log(pkg.description) // "💲  "awslocal" - Thin wrapper around the "aws" ..."
 * console.log(pkg.programs)    // ["awslocal"]
 * console.log(pkg.versions[0]) // "2023.12.28" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/localstack-cloud/awscli-local.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const localstackcloudawsclilocalPackage = {
  /**
  * The display name of this package.
  */
  name: 'awslocal' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'localstack.cloud/awscli-local' as const,
  /**
  * Brief description of what this package does.
  */
  description: '💲  "awslocal" - Thin wrapper around the "aws" command line interface for use with LocalStack' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/localstack.cloud/awscli-local/package.yml' as const,
  homepageUrl: 'https://www.localstack.cloud/' as const,
  githubUrl: 'https://github.com/localstack/awscli-local' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install localstack.cloud/awscli-local' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +localstack.cloud/awscli-local -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install localstack.cloud/awscli-local' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'awslocal',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
    'aws.amazon.com/cli^2',
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
    '2023.12.28',
  ] as const,
  aliases: [] as const,
}

export type LocalstackcloudawsclilocalPackage = typeof localstackcloudawsclilocalPackage
