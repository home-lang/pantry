/**
 * **Ollama** - A local LLM runner for running large language models.
 *
 * @domain `ollama.com`
 * @programs `ollama`
 * @version `0.5.7` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ollama.com`
 * @homepage https://ollama.com
 */
export const ollamacomPackage = {
  name: 'Ollama' as const,
  domain: 'ollama.com' as const,
  description: 'A local LLM runner for running large language models.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://ollama.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install ollama.com' as const,
  programs: ['ollama'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['0.5.7', '0.5.6'] as const,
  aliases: ['ollama'] as const,
}
export type OllamacomPackage = typeof ollamacomPackage
