/**
 * **ollama** - Get up and running with Llama 3.3, DeepSeek-R1, Phi-4, Gemma 2, and other large language models.
 *
 * @domain `ollama.ai`
 * @programs `ollama`
 * @version `0.18.2` (159 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ollama.ai`
 * @homepage https://ollama.com/
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.21`, `cmake.org@^3`, `linux:gnu.org/binutils` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.ollamaai
 * console.log(pkg.name)        // "ollama"
 * console.log(pkg.description) // "Get up and running with Llama 3.3, DeepSeek-R1,..."
 * console.log(pkg.programs)    // ["ollama"]
 * console.log(pkg.versions[0]) // "0.18.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ollama-ai.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const ollamaaiPackage = {
  /**
  * The display name of this package.
  */
  name: 'ollama' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ollama.ai' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Get up and running with Llama 3.3, DeepSeek-R1, Phi-4, Gemma 2, and other large language models.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ollama.ai/package.yml' as const,
  homepageUrl: 'https://ollama.com/' as const,
  githubUrl: 'https://github.com/ollama/ollama' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ollama.ai' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ollama.ai -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install ollama.ai' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ollama',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'go.dev@^1.21',
    'cmake.org@^3',
    'linux:gnu.org/binutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.18.2',
    '0.18.1',
    '0.18.0',
    '0.17.7',
    '0.17.6',
    '0.17.5',
    '0.17.4',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.17.8-rc4',
    '0.17.0',
    '0.16.3',
    '0.16.2',
    '0.16.1',
    '0.16.0',
    '0.15.6',
    '0.15.5',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.3',
    '0.14.2',
    '0.14.1',
    '0.14.0',
    '0.13.5',
    '0.13.4',
    '0.13.3',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.11',
    '0.12.10',
    '0.12.9',
    '0.12.8',
    '0.12.7',
    '0.12.6',
    '0.12.5',
    '0.12.4',
    '0.12.3',
    '0.12.2',
    '0.12.1',
    '0.12.0',
    '0.11.11',
    '0.11.10',
    '0.11.9',
    '0.11.8',
    '0.11.7',
  ] as const,
  aliases: [] as const,
}

export type OllamaaiPackage = typeof ollamaaiPackage
