import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kiro.dev/cli',
  name: 'cli',
  programs: [
    'kiro-cli',
    'kiro-cli-chat',
    'kiro-cli-term',
  ],
  dependencies: {
    'curl.se': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'sed -i "s/%%version%%/{{version}}/g" props/shim.{{hw.platform}}',
      'install -Dm755 props/shim.{{hw.platform}} {{prefix}}/bin/kiro-cli',
      'install -Dm755 props/shim.{{hw.platform}} {{prefix}}/bin/kiro-cli-chat',
      'install -Dm755 props/shim.{{hw.platform}} {{prefix}}/bin/kiro-cli-term',
    ],
  },
  test: {
    script: [
      'rm -rf {{prefix}}/libexec',
      'test ! -f "$BINS/kiro-cli"',
      'test ! -f "$BINS/kiro-cli-chat"',
      'test ! -f "$BINS/kiro-cli-term"',
      'kiro-cli --version | grep -w {{version}}',
      'test -f "$BINS/kiro-cli"',
      'timeout 0.5 kiro-cli --version | grep -w {{version}}',
      'kiro-cli-chat --version | grep -w {{version}}',
      'test -f "$BINS/kiro-cli-chat"',
      'kiro-cli-term --version | grep -w {{version}}',
      'test -f "$BINS/kiro-cli-term"',
      'kiro-cli chat --help >/dev/null',
    ],
  },
}
