import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ollama.ai',
  name: 'ollama',
  description: 'Get up and running with Llama 3.3, DeepSeek-R1, Phi-4, Gemma 2, and other large language models.',
  homepage: 'https://ollama.com/',
  github: 'https://github.com/ollama/ollama',
  programs: ['ollama'],
  versionSource: {
    type: 'github-releases',
    repo: 'ollama/ollama',
  },
  distributable: {
    url: 'git+https://github.com/ollama/ollama',
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'cmake.org': '^3',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'git submodule init',
      'git submodule update',
      'cd "llama"',
      'sed -i \'s/-D__ARM_FEATURE_MATMUL_INT8//g\' llama.go',
      'go generate ./...',
      'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/ollama\' .',
      'make dist -j {{hw.concurrency}}',
      'install -D dist/{{hw.platform}}-*/bin/ollama \'{{prefix}}/bin/ollama\'',
      'cd "build"',
      'cmake -S .. $CMAKE_ARGS',
      'cmake --build .',
      'cmake --install .',
      'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/ollama\' ../',
    ],
    env: {
      'GO_LDFLAGS': ['-X github.com/jmorganca/ollama/version.Version={{version}}', '-X github.com/ollama/ollama/version.Version={{version}}'],
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
