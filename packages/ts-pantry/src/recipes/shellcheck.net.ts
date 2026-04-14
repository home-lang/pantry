import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'shellcheck.net',
  name: 'shellcheck',
  description: 'ShellCheck, a static analysis tool for shell scripts',
  homepage: 'https://www.shellcheck.net/',
  github: 'https://github.com/koalaman/shellcheck',
  programs: ['shellcheck'],
  versionSource: {
    type: 'github-releases',
    repo: 'koalaman/shellcheck',
  },

  build: {
    script: [
      'OS=$(uname -s | tr "[:upper:]" "[:lower:]")',
      'ARCH=$(uname -m)',
      'case "$ARCH" in',
      '  arm64) ARCH="aarch64" ;;',
      'esac',
      'mkdir -p "{{prefix}}/bin" /tmp/shellcheck-extract',
      'curl -fSL "https://github.com/koalaman/shellcheck/releases/download/v{{version}}/shellcheck-v{{version}}.${OS}.${ARCH}.tar.xz" | tar xJ -C /tmp/shellcheck-extract',
      'cp /tmp/shellcheck-extract/shellcheck-v{{version}}/shellcheck "{{prefix}}/bin/"',
      'chmod +x "{{prefix}}/bin/shellcheck"',
    ],
  },
}
