/**
 * **eb** - Client for Amazon Elastic Beanstalk web service
 *
 * @domain `crates.io/eb`
 * @programs `eb`
 * @version `0.5.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/eb`
 * @homepage https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioeb
 * console.log(pkg.name)        // "eb"
 * console.log(pkg.description) // "Client for Amazon Elastic Beanstalk web service"
 * console.log(pkg.programs)    // ["eb"]
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/eb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioebPackage = {
  /**
  * The display name of this package.
  */
  name: 'eb' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/eb' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Client for Amazon Elastic Beanstalk web service' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/eb/package.yml' as const,
  homepageUrl: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html' as const,
  githubUrl: 'https://github.com/rye/eb' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/eb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/eb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/eb' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'eb',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioebPackage = typeof cratesioebPackage
