/**
 * **Vanna** - 🤖 Chat with your SQL database 📊. Accurate Text-to-SQL Generation via LLMs using RAG 🔄.
 *
 * @domain `vanna.ai`
 * @version `2.0.1` (44 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install vanna.ai`
 * @homepage https://vanna.ai/docs/
 * @dependencies `python.org~3.12`, `linux:openmp.llvm.org^17 # needed by chromadb` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.vannaai
 * console.log(pkg.name)        // "Vanna"
 * console.log(pkg.description) // "🤖 Chat with your SQL database 📊. Accurate Tex..."
 * console.log(pkg.versions[0]) // "2.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/vanna-ai.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vannaaiPackage = {
  /**
   * The display name of this package.
   */
  name: 'Vanna' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'vanna.ai' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🤖 Chat with your SQL database 📊. Accurate Text-to-SQL Generation via LLMs using RAG 🔄.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vanna.ai/package.yml' as const,
  homepageUrl: 'https://vanna.ai/docs/' as const,
  githubUrl: 'https://github.com/vanna-ai/vanna' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install vanna.ai' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vanna.ai -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install vanna.ai' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'python.org~3.12',
    'linux:openmp.llvm.org^17 # needed by chromadb',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.1',
    '2.0.0',
    '0.7.9',
    '0.7.8',
    '0.7.7',
    '0.7.6',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.6',
    '0.6.5',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.5',
    '0.5.4',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.4',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.1',
    '0.2.0',
    '0.1.1',
    '0.0.38',
    '0.0.37',
    '0.0.36',
    '0.0.35',
    '0.0.34',
    '0.0.33',
    '0.0.32',
  ] as const,
  aliases: [] as const,
}

export type VannaaiPackage = typeof vannaaiPackage
