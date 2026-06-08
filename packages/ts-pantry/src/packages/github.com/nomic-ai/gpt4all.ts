/**
 * **gpt4all** - Locally run an Assistant-Tuned Chat-Style LLM
 *
 * @domain `github.com/nomic-ai/gpt4all`
 * @programs `gpt4all`
 * @version `2023.3.29` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/nomic-ai/gpt4all`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomnomicaigpt4all
 * console.log(pkg.name)        // "gpt4all"
 * console.log(pkg.description) // "Locally run an Assistant-Tuned Chat-Style LLM "
 * console.log(pkg.programs)    // ["gpt4all"]
 * console.log(pkg.versions[0]) // "2023.3.29" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/nomic-ai/gpt4all.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const gpt4allPackage = {
  /**
  * The display name of this package.
  */
  name: 'gpt4all' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/nomic-ai/gpt4all' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Locally run an Assistant-Tuned Chat-Style LLM ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nomic-ai/gpt4all/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/zanussbaum/gpt4all.cpp' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/nomic-ai/gpt4all' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nomic-ai/gpt4all -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/nomic-ai/gpt4all' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gpt4all',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2023.03.29',
    '2023.3.29',
    '3.10.0',
    '3.9.0',
    '3.8.0',
    '3.7.0',
    '3.6.1',
    '3.6.0',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.1',
    '3.2.0',
    '3.1.1',
    '3.1.1-web_search_beta_2',
    '3.1.0',
    '3.1.0-web_search_beta',
    '3.0.0',
    '2.8.0',
    '2.7.5',
    '2.7.4',
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.2',
    '2.6.1',
    '2.5.4',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
  ] as const,
  aliases: [] as const,
}

export type Gpt4allPackage = typeof gpt4allPackage
