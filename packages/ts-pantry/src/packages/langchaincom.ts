/**
 * **langchain** - 🦜🔗 Build context-aware reasoning applications
 *
 * @domain `langchain.com`
 * @programs `f2py`, `jsondiff`, `jsonpatch`, `jsonpointer`, `langchain-server`, ... (+2 more)
 * @version `0.1.16` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install langchain.com`
 * @homepage https://python.langchain.com
 * @dependencies `python.org^3.12`, `docker.com/compose^2.23`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.langchaincom
 * console.log(pkg.name)        // "langchain"
 * console.log(pkg.description) // "🦜🔗 Build context-aware reasoning applications"
 * console.log(pkg.programs)    // ["f2py", "jsondiff", ...]
 * console.log(pkg.versions[0]) // "0.1.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/langchain-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const langchaincomPackage = {
  /**
   * The display name of this package.
   */
  name: 'langchain' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'langchain.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🦜🔗 Build context-aware reasoning applications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/langchain.com/package.yml' as const,
  homepageUrl: 'https://python.langchain.com' as const,
  githubUrl: 'https://github.com/langchain-ai/langchain' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install langchain.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +langchain.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install langchain.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'f2py',
    'jsondiff',
    'jsonpatch',
    'jsonpointer',
    'langchain-server',
    'langsmith',
    'normalizer',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org^3.12',
    'docker.com/compose^2.23',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.16',
    '0.1.15',
    '0.1.14',
    '0.1.13',
    '0.1.12',
    '0.1.11',
    '0.1.10',
    '0.1.9',
    '0.1.8',
    '0.1.7',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
    '0.0.354',
    '0.0.353',
    '0.0.352',
    '0.0.351',
    '0.0.350',
    '0.0.349',
    '0.0.348',
    '0.0.347',
    '0.0.346',
    '0.0.345',
    '0.0.344',
    '0.0.343',
  ] as const,
  aliases: [] as const,
}

export type LangchaincomPackage = typeof langchaincomPackage
