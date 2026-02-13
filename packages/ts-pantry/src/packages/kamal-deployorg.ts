/**
 * **kamal-deploy** - pkgx package
 *
 * @domain `kamal-deploy.org`
 * @version `2.10.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kamal-deploy.org`
 * @dependencies `ruby-lang.org^3.1`, `rubygems.org`
 * @buildDependencies `rubygems.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kamaldeployorg
 * console.log(pkg.name)        // "kamal-deploy"
 * console.log(pkg.versions[0]) // "2.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kamal-deploy-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kamaldeployorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'kamal-deploy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'kamal-deploy.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kamal-deploy.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install kamal-deploy.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kamal-deploy.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kamal-deploy.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ruby-lang.org^3.1',
    'rubygems.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'rubygems.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.10.1',
  ] as const,
  aliases: [] as const,
}

export type KamaldeployorgPackage = typeof kamaldeployorgPackage
