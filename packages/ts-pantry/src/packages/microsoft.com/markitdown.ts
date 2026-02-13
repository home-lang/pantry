/**
 * **markitdown** - Python tool for converting files and office documents to Markdown.
 *
 * @domain `microsoft.com/markitdown`
 * @programs `markitdown`
 * @version `0.0.1.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install microsoft.com/markitdown`
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.13` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.microsoftcommarkitdown
 * console.log(pkg.name)        // "markitdown"
 * console.log(pkg.description) // "Python tool for converting files and office doc..."
 * console.log(pkg.programs)    // ["markitdown"]
 * console.log(pkg.versions[0]) // "0.0.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/microsoft-com/markitdown.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const microsoftcommarkitdownPackage = {
  /**
   * The display name of this package.
   */
  name: 'markitdown' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'microsoft.com/markitdown' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python tool for converting files and office documents to Markdown.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/markitdown/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/microsoft/markitdown' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install microsoft.com/markitdown' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +microsoft.com/markitdown -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install microsoft.com/markitdown' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'markitdown',
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
    'python.org@~3.13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.0.1.3',
  ] as const,
  aliases: [] as const,
}

export type MicrosoftcommarkitdownPackage = typeof microsoftcommarkitdownPackage
