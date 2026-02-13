/**
 * **MetaGPT** - 🌟 The Multi-Agent Framework: First AI Software Company, Towards Natural Language Programming
 *
 * @domain `deepwisdom.ai`
 * @programs `metagpt`
 * @version `0.8.2` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install deepwisdom.ai`
 * @homepage https://deepwisdom.ai/
 * @dependencies `pkgx.sh^1`, `git-scm.org^2 # v0.7.0 requires it`
 * @buildDependencies `python.org@>=3.9<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.deepwisdomai
 * console.log(pkg.name)        // "MetaGPT"
 * console.log(pkg.description) // "🌟 The Multi-Agent Framework: First AI Software..."
 * console.log(pkg.programs)    // ["metagpt"]
 * console.log(pkg.versions[0]) // "0.8.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/deepwisdom-ai.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const deepwisdomaiPackage = {
  /**
   * The display name of this package.
   */
  name: 'MetaGPT' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'deepwisdom.ai' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🌟 The Multi-Agent Framework: First AI Software Company, Towards Natural Language Programming' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/deepwisdom.ai/package.yml' as const,
  homepageUrl: 'https://deepwisdom.ai/' as const,
  githubUrl: 'https://github.com/geekan/MetaGPT' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install deepwisdom.ai' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +deepwisdom.ai -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install deepwisdom.ai' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'metagpt',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
    'git-scm.org^2 # v0.7.0 requires it',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@>=3.9<3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.7',
    '0.7.6',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.6',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.0',
    '0.5.2',
  ] as const,
  aliases: [] as const,
}

export type DeepwisdomaiPackage = typeof deepwisdomaiPackage
