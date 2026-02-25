/**
 * **cli** - pkgx package
 *
 * @domain `kiro.dev/cli`
 * @version `1.26.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kiro.dev/cli`
 * @dependencies `curl.se`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kirodevcli
 * console.log(pkg.name)        // "cli"
 * console.log(pkg.versions[0]) // "1.26.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kiro-dev/cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kirodevcliPackage = {
  /**
  * The display name of this package.
  */
  name: 'cli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kiro.dev/cli' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kiro.dev/cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install kiro.dev/cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kiro.dev/cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kiro.dev/cli' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.26.2',
  ] as const,
  aliases: [] as const,
}

export type KirodevcliPackage = typeof kirodevcliPackage
