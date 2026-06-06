import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/nullclaw/nullclaw",
  name: "nullclaw",
  programs: [
    "nullclaw",
  ],
  buildDependencies: {
    'curl.se': "*",
  },
  distributable: null,
  build: {
    script: [
      "curl -fsSL \"https://github.com/nullclaw/nullclaw/releases/download/{{version.tag}}/${ASSET}\" -o nullclaw",
      "install -Dm755 nullclaw {{prefix}}/bin/nullclaw",
    ],
    env: {
      'darwin/aarch64': {
        ASSET: "nullclaw-macos-aarch64.bin",
      },
      'darwin/x86-64': {
        ASSET: "nullclaw-macos-x86_64.bin",
      },
      'linux/aarch64': {
        ASSET: "nullclaw-linux-aarch64.bin",
      },
      'linux/x86-64': {
        ASSET: "nullclaw-linux-x86_64.bin",
      },
    },
  },
  test: {
    script: [
      "LIBCV=$(getconf GNU_LIBC_VERSION | sed 's/^glibc //')\nif ! semverator gt $LIBCV 2.34; then\n  echo \"Skipping test on glibc $LIBCV\"\n  exit 0\nfi\n",
      "nullclaw --version",
      "nullclaw help >/dev/null 2>&1 || true",
    ],
  },
}
