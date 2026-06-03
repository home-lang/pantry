import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/nullclaw/nullclaw",
  name: "nullclaw",
  programs: [
    "nullclaw",
    "nullclaw-init",
  ],
  dependencies: {
    'github.com/mikefarah/yq': "*",
    'stedolan.github.io/jq': "*",
    'gnu.org/sed': "*",
  },
  buildDependencies: {
    'curl.se': "*",
  },
  distributable: undefined,
  build: {
    script: [
      "curl -fsSL \"https://github.com/nullclaw/nullclaw/releases/download/{{version.tag}}/${ASSET}\" -o nullclaw",
      "install -Dm755 nullclaw {{prefix}}/bin/nullclaw",
      "install -Dm755 props/nullclaw-init {{prefix}}/bin/nullclaw-init",
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
      "nullclaw-init --help | grep -q 'nullclaw-init'",
      "export OPENROUTER_API_KEY=\"test-key\"\nnullclaw-init $FIXTURE --write-only --output ./nullclaw-config.json\ntest -f ./nullclaw-config.json\njq -e '.agents.defaults.model.primary == \"openrouter/anthropic/claude-sonnet-4\"' ./nullclaw-config.json\njq -e '.models.providers.openrouter.api_key == \"test-key\"' ./nullclaw-config.json",
    ],
  },
}
