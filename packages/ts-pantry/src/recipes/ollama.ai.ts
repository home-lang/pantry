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
    // pkgx pins the git checkout to the release tag (`ref: v{{version}}`).
    // The buildkit reads `distributable.ref`, so carry it back to build the
    // requested version rather than the default branch HEAD.
    ref: 'v{{version}}',
  } as Recipe['distributable'] & { ref: string },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'cmake.org': '^3',
    'git-scm.org': '^2',
    linux: {
      // objdump needed for 0.5.8
      'gnu.org/binutils': '*',
    },
  },

  build: {
    script: [
      {
        run: [
          'git submodule init',
          'git submodule update',
        ],
        if: '>=0.0.18',
      },
      // arm64 build bug
      // https://github.com/ollama/ollama/issues/7292#issuecomment-2427773036
      {
        run: 'sed -i \'s/-D__ARM_FEATURE_MATMUL_INT8//g\' llama.go',
        'working-directory': 'llama',
        if: '>=0.4.0',
      },
      {
        run: [
          'go generate ./...',
          'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/ollama\' .',
        ],
        if: '<0.5.2',
      },
      {
        run: [
          'make dist -j {{hw.concurrency}}',
          'install -D dist/{{hw.platform}}-*/bin/ollama \'{{prefix}}/bin/ollama\'',
        ],
        if: '>=0.5.2<0.5.8',
      },
      {
        run: [
          'cmake -S .. $CMAKE_ARGS',
          'cmake --build .',
          'cmake --install .',
          'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/ollama\' ../',
        ],
        'working-directory': 'build',
        if: '>=0.5.8',
      },
    ],
    env: {
      'GO_LDFLAGS': [
        // versions older than 0.1.30
        '-X github.com/jmorganca/ollama/version.Version={{version}}',
        // new versions
        '-X github.com/ollama/ollama/version.Version={{version}}',
      ],
      'CMAKE_ARGS': [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
      linux: {
        // else segfaults
        'GO_LDFLAGS': ['-buildmode=pie'],
        'CGO_LDFLAGS': ['-lstdc++fs'],
      },
    },
  },
}
