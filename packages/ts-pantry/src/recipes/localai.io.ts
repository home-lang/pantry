import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'localai.io',
  name: 'LocalAI',
  description: ':robot: The free, Open Source alternative to OpenAI, Claude and others. Self-hosted and local-first. Drop-in replacement for OpenAI,  running on consumer-grade hardware. No GPU required. Runs gguf, transformers, diffusers and many more models architectures. Features: Generate Text, Audio, Video, Images, Voice Cloning, Distributed, P2P inference',
  homepage: 'https://localai.io',
  github: 'https://github.com/mudler/LocalAI',
  programs: ['local-ai'],
  versionSource: {
    type: 'github-releases',
    repo: 'mudler/LocalAI',
  },
  distributable: {
    url: 'git+https://github.com/mudler/LocalAI',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'cmake.org': '^3',
    'grpc.io': '=1.72.1',
    'gnu.org/wget': '^1',
    'gnu.org/coreutils': '^9',
    'git-scm.org': '^2',
    'google.com/protobuf-go': '^1',
    'grpc.io/grpc-go': '^1',
    'info-zip.org/unzip': '*',
  },

  build: {
    script: [
      'if test "{{hw.platform}}" = "darwin"; then',
      '  LLAMA_VERSION=\'CPPLLAMA_VERSION=387a1598ca094a4755303ec964c3b09b4c5c300e\'',
      'fi',
      '',
      'make build $LLAMA_VERSION',
      'install -D local-ai {{prefix}}/bin/local-ai',
    ],
  },
}
