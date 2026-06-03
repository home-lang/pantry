import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wasmer.io',
  name: 'wasmer',
  description: '🚀 Fast, secure, lightweight containers based on WebAssembly',
  homepage: 'https://wasmer.io',
  github: 'https://github.com/wasmerio/wasmer',
  programs: ['wasmer'],
  versionSource: {
    type: 'github-releases',
    repo: 'wasmerio/wasmer',
    // Only stable releases (skip v7.x alpha/rc tags). The full-source tarball
    // (with submodules) is published per stable release since v7.1.0.
    stable: true,
  },
  // The plain GitHub archive tarball omits the git submodules that
  // `make build-wasmer` needs, so the build fails. Use the
  // `wasmer-full-source.tar.xz` release asset (added in v7.1.0) which bundles
  // every submodule. Mirrors pkgxdev/pantry's preferred distributable.
  distributable: {
    url: 'https://github.com/wasmerio/wasmer/releases/download/{{version.tag}}/wasmer-full-source.tar.xz',
    stripComponents: 1,
  },
  // Runtime dep on Linux only (as of v7), mirroring pkgx.
  dependencies: {
    linux: {
      'sourceware.org/libffi': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '^0',
    'nodejs.org': '^18',
    'gnu.org/make': '^4',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'make build-wasmer',
      'mv target/release/wasmer {{prefix}}/bin',
    ],
    env: {
      // -A warnings: ignore warnings (focus on errors)
      // -C debuginfo=0: strip debug info to shrink the binary
      'RUSTFLAGS': ['-A warnings', '-C debuginfo=0'],
      // pkgx builds the C bits with clang on Linux.
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
    },
  },
}
