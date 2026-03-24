/**
 * **langchain** - 🦜🔗 Build context-aware reasoning applications
 *
 * @domain `langchain.com`
 * @programs `f2py`, `jsondiff`, `jsonpatch`, `jsonpointer`, `langchain-server`, ... (+2 more)
 * @version `0.1.16` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install langchain.com`
 * @homepage https://python.langchain.com
 * @dependencies `python.org^3.12`, `docker.com/compose^2.23`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.langchaincom
 * console.log(pkg.name)        // "langchain"
 * console.log(pkg.description) // "🦜🔗 Build context-aware reasoning applications"
 * console.log(pkg.programs)    // ["f2py", "jsondiff", ...]
 * console.log(pkg.versions[0]) // "0.1.16" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/langchain-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install langchain.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +langchain.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install langchain.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    'langchain-anthropic==1.4.0',
    'langchain-core==0.3.83',
    'langchain-core==0.3.82',
    'langchain==0.3.28',
    'langchain-anthropic==1.3.5',
    'langchain-anthropic==1.3.4',
    'langchain-anthropic==1.3.3',
    'langchain-anthropic==1.3.2',
    'langchain-core==1.2.21',
    'langchain-core==1.2.20',
    'langchain-core==1.2.19',
    'langchain-core==1.2.18',
    'langchain-core==1.2.17',
    'langchain-core==1.2.16',
    'langchain-core==1.2.15',
    'langchain-core==1.2.14',
    'langchain==1.2.13',
    'langchain-core==1.2.13',
    'langchain==1.2.12',
    'langchain-core==1.2.12',
    'langchain==1.2.11',
    'langchain-core==1.2.11',
    'langchain==1.2.10',
    'langchain-core==1.2.10',
    'langchain==1.2.9',
    'langchain-core==1.2.9',
    'langchain==1.2.8',
    'langchain-core==1.2.8',
    'langchain==1.2.7',
    'langchain-core==1.2.7',
    'langchain==1.2.6',
    'langchain==1.2.5',
    'langchain==1.2.4',
    'langchain-xai==1.2.2',
    'langchain-huggingface==1.2.1',
    'langchain-openai==1.1.12',
    'langchain-openai==1.1.11',
    'langchain-openai==1.1.10',
    'langchain-openai==1.1.9',
    'langchain-openai==1.1.8',
    'langchain-tests==1.1.5',
    'langchain-standard-tests==1.1.4',
    'langchain-standard-tests==1.1.3',
    'langchain-mistralai==1.1.2',
    'langchain-groq==1.1.2',
    'langchain-text-splitters==1.1.1',
    'langchain-openrouter==0.1.0',
    'langchain-classic==1.0.3',
    'langchain-classic==1.0.2',
    'langchain-openrouter==0.0.2',
  ] as const,
  aliases: [] as const,
}

export type LangchaincomPackage = typeof langchaincomPackage
