import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/ggerganov/whisper.cpp",
  name: "whisper",
  programs: [
    "whisper.cpp",
    "whisper-cli",
  ],
  dependencies: {
    'libsdl.org': "*",
    linux: {
      'openmp.llvm.org': 18,
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': "~0.29",
    'gnu.org/patch': "*",
    'gnu.org/coreutils': "*",
    'cmake.org': 3,
  },
  distributable: {
    url: "https://github.com/ggerganov/whisper.cpp/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "patch -p1 < props/illegal_instruction.patch",
        if: "<1.4.3",
      },
      {
        run: "make --jobs {{ hw.concurrency }}\nmake stream --jobs {{ hw.concurrency }}\nmake command --jobs {{ hw.concurrency }}\ninstall -Dt {{prefix}}/bin stream command\ninstall -D main {{prefix}}/bin/whisper.cpp",
        if: "<1.7.3",
      },
      {
        run: "cp ggml-metal.metal {{prefix}}/bin",
        if: "<1.7",
      },
      {
        run: "cp ggml/src/ggml-metal.metal {{prefix}}/bin",
        if: ">=1.7<1.7.3",
      },
      {
        run: "sed -i 's/add_subdirectory(deprecation-warning)/#add_subdirectory(deprecation-warning)/' CMakeLists.txt",
        if: ">=1.7.4",
        'working-directory': "examples",
      },
      {
        run: "cmake -B . -S .. $CMAKE_ARGS\ncmake --build . --parallel {{ hw.concurrency }} --config Release\ncmake --install . --prefix {{prefix}}",
        if: ">=1.7.3",
        'working-directory': "build",
      },
      {
        run: "install -D main {{prefix}}/bin/whisper-cli",
        if: "=1.7.3",
        'working-directory': "build/bin",
      },
      {
        run: "install -D whisper-cli {{prefix}}/bin/whisper-cli",
        if: ">=1.7.4",
        'working-directory': "build/bin",
      },
      {
        run: "ln -s whisper-cli whisper.cpp",
        'working-directory': "${{prefix}}/bin",
      },
      "install -D models/download-ggml-model.sh {{prefix}}/bin/download-ggml-model.sh",
      "install -D examples/command/commands.txt {{prefix}}/share/whisper.cpp/commands.txt",
    ],
    env: {
      linux: {
        CMAKE_ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-Wl,-lstdc++fs,-lpthread",
        ],
      },
    },
  },
  test: {
    script: [
      "hf download ggerganov/whisper.cpp ggml-base.en.bin",
      "model=\"$(find \"$cache\" -name \"ggml-base.en.bin\")\"",
      "curl https://github.com/ggerganov/whisper.cpp/raw/master/samples/jfk.wav | whisper-cli --model \"$model\" -",
    ],
  },
}
