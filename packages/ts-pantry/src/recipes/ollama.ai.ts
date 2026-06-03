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
  // Use the GitHub release source tarball instead of a git clone. The buildkit's
  // shallow `git clone --branch v{{version}}` can fall back to a full clone of the
  // DEFAULT branch when the shallow clone is flaky, and the subsequent
  // `git checkout v{{version}}` is best-effort — leaving the tree at main HEAD,
  // where `llama/llama.go` no longer exists (it was restructured upstream). That
  // produced the `sed: can't read llama.go` failure. The release tarball is a
  // single stable download that ships the fully vendored tree (llama/llama.go,
  // root CMakeLists.txt, llama/llama.cpp) and is pinned to the exact tag.
  distributable: {
    url: 'https://github.com/ollama/ollama/archive/refs/tags/v{{version}}.tar.gz',
    'strip-components': 1,
  },
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
      // NOTE: the upstream `git submodule init && git submodule update` step was
      // dropped — current ollama releases vendor llama.cpp directly (no
      // .gitmodules), and we now build from the release tarball which has no
      // `.git`, so that step is a no-op that only emitted spurious curl 404s.
      // arm64 build bug
      // https://github.com/ollama/ollama/issues/7292#issuecomment-2427773036
      {
        // ARM-only tweak; guard it because newer ollama (>=0.6) restructured the
        // tree and llama/llama.go no longer exists, which hard-failed the build.
        run: '[ -f llama.go ] && sed -i \'s/-D__ARM_FEATURE_MATMUL_INT8//g\' llama.go || true',
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
