import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "astral.sh/uv",
  name: "uv",
  programs: [
    "uv",
    "uvx",
  ],
  dependencies: {
    'libgit2.org': ">=1.7<2",
  },
  buildDependencies: {
    linux: {
      'nixos.org/patchelf': "^0.18",
      'sqlite.org': "*",
    },
    'cmake.org': ">=3.28",
    'rust-lang.org/cargo': "^0",
    'maturin.rs': "^1.4.0",
    'info-zip.org/unzip': "^6",
  },
  distributable: {
    url: "https://github.com/astral-sh/uv/releases/download/{{version}}/source.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "maturin build --locked --release --out ./out",
      {
        run: "unzip ./uv-{{version}}-*.whl\ninstall -D ./uv-{{version}}.data/scripts/uv {{prefix}}/bin/uv\ninstall -D ./uv-{{version}}.data/scripts/uvx {{prefix}}/bin/uvx",
        'working-directory': "out",
      },
      {
        run: "install_name_tool -change \"@rpath/gnu.org/libiconv/v1/lib/libiconv.2.dylib\" \"/usr/lib/libiconv.2.dylib\" uv\ninstall_name_tool -change \"@rpath/gnu.org/libiconv/v1/lib/libiconv.2.dylib\" \"/usr/lib/libiconv.2.dylib\" uvx",
        if: "darwin",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      'linux/aarch64': {
        JEMALLOC_SYS_WITH_LG_PAGE: 16,
      },
    },
  },
  test: {
    script: [
      "uv --version | grep {{version}}",
      "if command -v flask; then\n  false\nfi\n\nuv venv\nsource .venv/bin/activate\nuv pip install flask\n\nmv $FIXTURE app.py\nset -m\nflask run --port $PORT &\nPID=$!\n\nfor i in $(seq 1 15); do\n  curl -sf 127.0.0.1:$PORT && break\n  sleep 1\ndone\n\ntest \"$(curl 127.0.0.1:$PORT)\" = \"<p>Hello, World!</p>\"\nkill $PID || true",
    ],
  },
}
