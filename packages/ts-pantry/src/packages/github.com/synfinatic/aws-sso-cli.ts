/**
 * **aws-sso** - A powerful tool for using AWS Identity Center for the CLI and web console.
 *
 * @domain `github.com/synfinatic/aws-sso-cli`
 * @programs `aws-sso`
 * @version `2.1.0` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/synfinatic/aws-sso-cli`
 * @homepage https://synfinatic.github.io/aws-sso-cli/
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsynfinaticawsssocli
 * console.log(pkg.name)        // "aws-sso"
 * console.log(pkg.description) // "A powerful tool for using AWS Identity Center f..."
 * console.log(pkg.programs)    // ["aws-sso"]
 * console.log(pkg.versions[0]) // "2.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/synfinatic/aws-sso-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const awsssocliPackage = {
  /**
  * The display name of this package.
  */
  name: 'aws-sso' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/synfinatic/aws-sso-cli' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A powerful tool for using AWS Identity Center for the CLI and web console.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/synfinatic/aws-sso-cli/package.yml' as const,
  homepageUrl: 'https://synfinatic.github.io/aws-sso-cli/' as const,
  githubUrl: 'https://github.com/synfinatic/aws-sso-cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/synfinatic/aws-sso-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/synfinatic/aws-sso-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/synfinatic/aws-sso-cli' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'aws-sso',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.0',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.1',
    '1.15.0',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.1',
    '1.13.0',
  ] as const,
  aliases: [] as const,
}

export type AwsssocliPackage = typeof awsssocliPackage
