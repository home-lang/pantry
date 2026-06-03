import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/openclaw/openclaw",
  name: "openclaw",
  programs: [
    "openclaw",
    "openclaw-init",
  ],
  dependencies: {
    'nodejs.org': "*",
    'github.com/mikefarah/yq': "*",
    'stedolan.github.io/jq': "*",
    'gnu.org/sed': "*",
  },
  buildDependencies: {
    'nodejs.org': "*",
    'npmjs.com': "*",
    linux: {
      'cmake.org': 3,
    },
  },
  distributable: {
    url: "https://registry.npmjs.org/openclaw/-/openclaw-{{version}}.tgz",
    stripComponents: 1,
  },
  build: {
    script: [
      "npm i $ARGS .",
      "install -Dm755 props/openclaw-init {{prefix}}/bin/openclaw-init",
    ],
    env: {
      ARGS: [
        "--global",
        "--prefix={{prefix}}",
        "--install-links",
        "--unsafe-perm",
      ],
    },
  },
  test: {
    script: [
      "openclaw --version | grep -q \"{{version}}\"",
      "openclaw help >/dev/null 2>&1 || true",
      "openclaw-init --help | grep -q \"openclaw-init\"",
      "export OPENAI_API_KEY=\"test-key\"\nopenclaw-init $FIXTURE --write-only --output ./openclaw.json\ntest -f ./openclaw.json\njq -e '.agent.model == \"openai/gpt-5\"' ./openclaw.json\njq -e '.agents.defaults.workspace == \".\"' ./openclaw.json",
    ],
  },
}
