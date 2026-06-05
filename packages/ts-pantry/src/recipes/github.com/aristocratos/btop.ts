import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/aristocratos/btop',
  name: 'btop',
  programs: [
    'btop',
  ],
  dependencies: {
    linux: {
      'gnu.org/gcc/libstdcxx': '14',
    },
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '14',
      'llvm.org': '*',
    },
  },
  distributable: {
    url: 'https://github.com/aristocratos/btop/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        // intel_gpu_top.c only exists in btop 1.4.x+; guard so the 1.3.x tree
        // (which has neither the dir nor the file) doesn't abort on the
        // missing path.
        run: 'f=src/linux/intel_gpu_top/intel_gpu_top.c; test -f "$f" && sed -i -e \'s/ifdef __clang__/if 1/\' -e \'1i\\#define _GNU_SOURCE\' "$f" || true',
        if: 'linux/x86-64',
      },
      // btop 1.4.x uses C++23 std::ranges::to, which needs libstdc++ 14.
      // The prebuilt gnu.org/gcc@14 toolchain isn't in our S3 registry yet, so
      // the recipe's `gnu.org/gcc@14` build-dep silently falls back to system
      // g++ 13 (no std::ranges::to). Worse, buildkit's cc_wrapper re-exports
      // CXX=cc_wrapper/c++ (wrapping system g++ 13) AFTER our `build.env`, so a
      // recipe-level `CXX: g++-14` is clobbered. Install a 14-series g++ and
      // pass CXX/CC on make's command line, where they override everything.
      {
        run: 'command -v g++-14 >/dev/null 2>&1 || { sudo apt-get update -y >/dev/null 2>&1 || true; sudo DEBIAN_FRONTEND=noninteractive apt-get install -y g++-14 >/dev/null 2>&1 || true; }',
        if: 'linux/x86-64',
      },
      // Linux: build with the 14-series g++ (C++23 std::ranges::to).
      {
        run: 'make CXX=g++-14 && make install PREFIX={{prefix}} CXX=g++-14',
        if: 'linux/x86-64',
      },
      // macOS: btop's own Makefile appends -Wno-error=incompatible-function-pointer-types
      // (a clang-only flag) for the macos target. buildkit's cc_wrapper points
      // CXX at gcc, which rejects that flag, so force the real Apple clang where
      // the flag is valid.
      {
        run: 'make CXX="$(xcrun -f clang++ 2>/dev/null || echo clang++)" && make install PREFIX={{prefix}} CXX="$(xcrun -f clang++ 2>/dev/null || echo clang++)"',
        if: 'darwin',
      },
    ],
    env: {
      linux: {
        CXX: 'g++-14',
        CC: 'gcc-14',
        LD: 'clang++',
        CXXFLAGS: '$CXXFLAGS -ffat-lto-objects',
        LDFLAGS: '$LDFLAGS -Wl,-lstdc++,-ldl -fno-lto',
      },
    },
  },
}
