import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'astral.sh/uv',
  name: 'uv',
  programs: [
    'uv',
    'uvx',
  ],
  // Download official prebuilt binaries instead of compiling from source.
  // Astral ships per-version, multi-platform release tarballs (uv + uvx).
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TRIPLE="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TRIPLE="x86_64-apple-darwin" ;;',
      '  linux+aarch64)  TRIPLE="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TRIPLE="x86_64-unknown-linux-gnu" ;;',
      'esac',
      'URL="https://github.com/astral-sh/uv/releases/download/${VERSION}/uv-${TRIPLE}.tar.gz"',
      'curl -Lfo uv.tar.gz "$URL"',
      'tar xzf uv.tar.gz',
      'install -Dm755 "uv-${TRIPLE}/uv" {{prefix}}/bin/uv',
      'install -Dm755 "uv-${TRIPLE}/uvx" {{prefix}}/bin/uvx',
    ],
  },
  test: {
    script: [
      'uv --version | grep {{version}}',
      'if command -v flask; then\n  false\nfi\n\nuv venv\nsource .venv/bin/activate\nuv pip install flask\n\nmv $FIXTURE app.py\nset -m\nflask run --port $PORT &\nPID=$!\n\nfor i in $(seq 1 15); do\n  curl -sf 127.0.0.1:$PORT && break\n  sleep 1\ndone\n\ntest "$(curl 127.0.0.1:$PORT)" = "<p>Hello, World!</p>"\nkill $PID || true',
    ],
  },
}
