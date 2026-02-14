/**
 * **aichat** - All-in-one LLM CLI tool featuring Shell Assistant, Chat-REPL, RAG, AI Tools & Agents, with access to OpenAI, Claude, Gemini, Ollama, Groq, and more.
 *
 * @domain `crates.io/aichat`
 * @programs `aichat`
 * @version `0.30.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/aichat`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioaichat
 * console.log(pkg.name)        // "aichat"
 * console.log(pkg.description) // "All-in-one LLM CLI tool featuring Shell Assista..."
 * console.log(pkg.programs)    // ["aichat"]
 * console.log(pkg.versions[0]) // "0.30.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/aichat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioaichatPackage = {
  /**
  * The display name of this package.
  */
  name: 'aichat' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/aichat' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'All-in-one LLM CLI tool featuring Shell Assistant, Chat-REPL, RAG, AI Tools & Agents, with access to OpenAI, Claude, Gemini, Ollama, Groq, and more.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/aichat/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sigoden/aichat' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/aichat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/aichat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/aichat' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'aichat',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.30.0',
    '0.29.0',
    '0.28.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioaichatPackage = typeof cratesioaichatPackage
