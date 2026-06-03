import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/ggerganov/llama.cpp",
  name: "llama",
  programs: [
    "llama-cli",
    "llama.cpp",
    "convert.py",
  ],
  dependencies: {
    'pkgx.sh': ">=1",
    'curl.se': 8,
    linux: {
      'gnu.org/gcc/libstdcxx': 14,
      'gnu.org/gcc': 14,
    },
  },
  buildDependencies: {
    'gnu.org/coreutils': "*",
    'git-scm.org': "*",
    'python.org': "~3.11",
    'cmake.org': 3,
    'linux/aarch64': {
      'kernel.org/linux-headers': "*",
    },
  },
  distributable: {
    url: "https://github.com/ggerganov/llama.cpp/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i -e's/\\(MK_.* -march=native -mtune=native\\)/#\\1/g' Makefile",
        if: "linux/x86-64",
      },
      {
        run: "curl -LSs 'https://github.com/ggerganov/llama.cpp/pull/4630/commits/42f5246effafddcf87d67656b58e95030f4bc454.patch' | patch -p1 -R",
        if: ">=1705<1732",
      },
      {
        run: "sed -i -e's/-mcpu=native/-mcpu=generic/g' CMakeLists.txt",
        if: "linux/aarch64",
        'working-directory': "ggml/src/ggml-cpu",
      },
      {
        run: "sed -i -f $PROP ggml.c",
        if: "linux/aarch64",
        'working-directory': "ggml/src",
      },
      {
        run: "make --jobs {{hw.concurrency}}",
        if: "<4242",
      },
      {
        run: "cmake -B build $CMAKE_ARGS\ncmake --build build --config Release\ncmake --install build --prefix {{prefix}}",
        if: ">=4242",
      },
      "if test -f llama-cli; then\n  install -D llama-cli {{prefix}}/bin/llama-cli\n  # legacy name\n  ln -s llama-cli {{prefix}}/bin/llama.cpp\nelif test -f main; then\n  install -D main {{prefix}}/bin/llama.cpp\n  # new name\n  ln -s llama.cpp {{prefix}}/bin/llama-cli\nelif test -f {{prefix}}/bin/llama-cli; then\n  ln -s llama-cli {{prefix}}/bin/llama.cpp\nelse\n  echo \"No binary found\"\n  exit 1\nfi\n",
      "install -D props/entrypoint.sh {{prefix}}/entrypoint.sh",
      "if test -f ggml-metal.metal; then\n  install -D ggml-metal.metal {{prefix}}/bin/ggml-metal.metal\nelif test -f ggml/src/ggml-metal.metal; then\n  install -D ggml/src/ggml-metal.metal {{prefix}}/bin/ggml-metal.metal\nelif test -f ggml/src/ggml-metal/ggml-metal.metal; then\n  install -D ggml/src/ggml-metal/ggml-metal.metal {{prefix}}/bin/ggml-metal.metal\nelse\n  echo \"No ggml-metal.metal found\"\n  exit 1\nfi\n",
      {
        run: "mkdir -p {{prefix}}/share\nmv prompts {{prefix}}/share",
        if: "<4242",
      },
      "if test -f convert.py; then\n  install -D convert.py $VIRTUAL_ENV/bin/convert.py\nelif test -f examples/convert-legacy-llama.py; then\n  install -D examples/convert-legacy-llama.py $VIRTUAL_ENV/bin/convert.py\nelif test -f examples/convert_legacy_llama.py; then\n  install -D examples/convert_legacy_llama.py $VIRTUAL_ENV/bin/convert.py\nelse\n  echo \"No convert.py found\"\n  false\nfi\n",
      "bkpyvenv stage {{prefix}} {{version}}",
      "$VIRTUAL_ENV/bin/pip install -r requirements.txt",
      "bkpyvenv seal {{prefix}} convert.py",
      {
        run: "SHEBANG=$(head -n1 tqdm)\nsed -i \"1s|^.*$|#!$SHEBANG|\" convert.py",
        'working-directory': "${{prefix}}/venv/bin",
      },
    ],
    env: {
      VIRTUAL_ENV: "${{prefix}}/venv",
    },
  },
  test: {
    script: [
      "llama.cpp --help",
      "llama.cpp --version",
      "llama-cli --version",
    ],
  },
}
