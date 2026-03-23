import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ollama.com',
  name: 'Ollama',
  description: 'A local LLM runner for running large language models.',
  homepage: 'https://ollama.com',
  programs: ['ollama'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      'curl -fSL -L "https://github.com/ollama/ollama/releases/download/v{{version}}/Ollama-darwin.zip" -o /tmp/ollama.zip',
      'cd /tmp && unzip -qo ollama.zip',
      'mkdir -p "{{prefix}}"',
      'mv "/tmp/Ollama.app" "{{prefix}}/Ollama.app"',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Ollama.app/Contents/MacOS/Ollama" "{{prefix}}/bin/ollama"',
    ],
  },
}
