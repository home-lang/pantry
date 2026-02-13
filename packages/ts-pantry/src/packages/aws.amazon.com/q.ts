/**
 * **q** - pkgx package
 *
 * @domain `aws.amazon.com/q`
 * @version `1.19.7` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install aws.amazon.com/q`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.awsamazoncomq
 * console.log(pkg.name)        // "q"
 * console.log(pkg.versions[0]) // "1.19.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/aws-amazon-com/q.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const awsamazoncomqPackage = {
  /**
   * The display name of this package.
   */
  name: 'q' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'aws.amazon.com/q' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aws.amazon.com/q/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install aws.amazon.com/q' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aws.amazon.com/q -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install aws.amazon.com/q' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.19.7',
    '1.19.6',
    '1.19.5',
    '1.19.4',
    '1.19.3',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.1',
  ] as const,
  aliases: [] as const,
}

export type AwsamazoncomqPackage = typeof awsamazoncomqPackage
