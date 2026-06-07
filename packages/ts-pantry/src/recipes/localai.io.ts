import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
    // pkgx pins the git checkout to the release tag (`ref: ${{version.tag}}`).
    // Without this the buildkit clones the default branch (a moving target) so
    // the build does not match the version being released.
    ref: '{{version.tag}}',
  } as Recipe['distributable'] & { ref: string },
  dependencies: {
    darwin: {
      'openmp.llvm.org': '18',
    },
    // companions in pkgx — needed at runtime on linux
    linux: {
      'openssl.org': '*',
    },
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'cmake.org': '^3',
    'grpc.io': '=1.72.1', // as of v3
    'gnu.org/wget': '^1',
    'gnu.org/coreutils': '^9',
    'git-scm.org': '^2',
    'google.com/protobuf-go': '^1',
    'grpc.io/grpc-go': '^1',
    'info-zip.org/unzip': '*', // since 3.2.0
    'nodejs.org': '*', // since 4.0.0
    'npmjs.com': '*', // since 4.0.0
    linux: {
      'gnu.org/gcc': '14', // linux needs omp.h
    },
    darwin: {
      'protobuf.dev': '~28.1.0',
      'llvm.org': '18', // apple doesn't support -fopenmp
    },
  },

  build: {
    env: {
      linux: {
        // one of these will do it. probably.
        CGO_LDFLAGS: ['-lstdc++fs'],
        LD_FLAGS: ['-buildmode=pie'],
      },
      darwin: {
        // strangely, it doesn't find the libomp.dylib
        CGO_LDFLAGS: '-L{{deps.openmp.llvm.org.prefix}}/lib',
      },
    },
    script: [
      // compiler complains about `visionOS 2.0,` in the metal file
      {
        run: [
          'if test "{{hw.platform}}" = "darwin"; then',
          '  LLAMA_VERSION=\'CPPLLAMA_VERSION=387a1598ca094a4755303ec964c3b09b4c5c300e\'',
          'fi',
        ],
        if: '>=2.26<2.29',
      },
      'make build $LLAMA_VERSION',
      'install -D local-ai {{prefix}}/bin/local-ai',
    ],
  },
}
