/**
 * **prettier** - Code formatter for JavaScript, CSS, JSON, GraphQL, Markdown, YAML
 *
 * @domain `prettier.io`
 * @programs `prettier`
 * @version `3.8.1` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install prettier.io`
 * @homepage https://prettier.io/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com@^10` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.prettierio
 * console.log(pkg.name)        // "prettier"
 * console.log(pkg.description) // "Code formatter for JavaScript, CSS, JSON, Graph..."
 * console.log(pkg.programs)    // ["prettier"]
 * console.log(pkg.versions[0]) // "3.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/prettier-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const prettierioPackage = {
  /**
   * The display name of this package.
   */
  name: 'prettier' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'prettier.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Code formatter for JavaScript, CSS, JSON, GraphQL, Markdown, YAML' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/prettier.io/package.yml' as const,
  homepageUrl: 'https://prettier.io/' as const,
  githubUrl: 'https://github.com/prettier/prettier' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install prettier.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +prettier.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install prettier.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'prettier',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org^20',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com@^10',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.8.1',
    '3.8.0',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.5',
  ] as const,
  aliases: [] as const,
}

export type PrettierioPackage = typeof prettierioPackage
