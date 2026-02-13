/**
 * **cfn-lint** - Validate CloudFormation templates against the CloudFormation spec
 *
 * @domain `github.com/aws-cloudformation/cfn-lint`
 * @programs `cfn-lint`
 * @version `1.43.4` (170 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/aws-cloudformation/cfn-lint`
 * @dependencies `pkgx.sh@1`, `pyyaml.org`, `github.com/benjaminp/six`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomawscloudformationcfnlint
 * console.log(pkg.name)        // "cfn-lint"
 * console.log(pkg.description) // "Validate CloudFormation templates against the C..."
 * console.log(pkg.programs)    // ["cfn-lint"]
 * console.log(pkg.versions[0]) // "1.43.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/aws-cloudformation/cfn-lint.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cfnlintPackage = {
  /**
   * The display name of this package.
   */
  name: 'cfn-lint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/aws-cloudformation/cfn-lint' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Validate CloudFormation templates against the CloudFormation spec' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/aws-cloudformation/cfn-lint/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/aws-cloudformation/cfn-lint' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/aws-cloudformation/cfn-lint' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/aws-cloudformation/cfn-lint -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/aws-cloudformation/cfn-lint' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cfn-lint',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh@1',
    'pyyaml.org',
    'github.com/benjaminp/six',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.43.4',
    '1.43.3',
    '1.43.2',
    '1.43.1',
    '1.43.0',
    '1.42.1',
    '1.42.0',
    '1.41.0',
    '1.40.4',
    '1.40.3',
    '1.40.2',
    '1.40.1',
    '1.40.0',
    '1.39.1',
    '1.39.0',
    '1.38.3',
    '1.38.2',
    '1.38.1',
    '1.38.0',
    '1.37.2',
    '1.37.1',
    '1.37.0',
    '1.36.1',
    '1.36.0',
    '1.35.4',
    '1.35.3',
    '1.35.2',
    '1.35.1',
    '1.35.0',
    '1.34.2',
    '1.34.1',
    '1.34.0',
    '1.33.2',
    '1.33.1',
    '1.33.0',
    '1.32.4',
    '1.32.3',
    '1.32.2',
    '1.32.1',
    '1.32.0',
    '1.31.3',
    '1.31.2',
    '1.31.1',
    '1.31.0',
    '1.30.0',
    '1.29.1',
    '1.29.0',
    '1.28.0',
    '1.27.0',
    '1.26.1',
    '1.26.0',
    '1.25.1',
    '1.25.0',
    '1.24.0',
    '1.23.1',
    '1.23.0',
    '1.22.7',
    '1.22.6',
    '1.22.5',
    '1.22.4',
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.2',
    '1.20.1',
    '1.20.0',
    '1.19.0',
    '1.18.4',
    '1.18.3',
    '1.18.2',
    '1.18.1',
    '1.18.0',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.2',
    '1.15.1',
    '1.15.0',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.0',
    '1.12.4',
    '1.12.3',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.7',
    '1.9.6',
    '1.9.5',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.7',
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '0.87.11',
    '0.87.10',
    '0.87.9',
    '0.87.8',
    '0.87.7',
    '0.87.6',
    '0.87.5',
    '0.87.4',
    '0.87.3',
    '0.87.2',
    '0.87.1',
    '0.87.0',
    '0.86.4',
    '0.86.3',
    '0.86.2',
    '0.86.1',
    '0.86.0',
    '0.85.3',
    '0.85.2',
    '0.85.1',
    '0.85.0',
    '0.84.0',
    '0.83.8',
    '0.83.7',
    '0.83.6',
    '0.83.5',
    '0.83.4',
    '0.83.3',
    '0.83.2',
    '0.83.1',
    '0.83.0',
    '0.82.2',
    '0.82.1',
    '0.82.0',
    '0.81.0',
    '0.80.4',
    '0.80.3',
    '0.80.2',
    '0.80.1',
    '0.79.11',
    '0.79.10',
    '0.79.9',
  ] as const,
  aliases: [] as const,
}

export type CfnlintPackage = typeof cfnlintPackage
