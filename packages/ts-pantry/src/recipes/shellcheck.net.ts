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
  // Prebuilt download: ShellCheck is a Haskell program (very slow/hard to
  // compile from source). Upstream ships official per-platform release archives
  // (`shellcheck-v<ver>.<os>.<arch>.tar.xz`) for darwin/linux × aarch64/x86_64.
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin.aarch64" ;;',
      '  darwin+x86-64)  ASSET="darwin.x86_64"  ;;',
      '  linux+aarch64)  ASSET="linux.aarch64"  ;;',
      '  linux+x86-64)   ASSET="linux.x86_64"   ;;',
      'esac',
      '',
      'mkdir -p /tmp/shellcheck-extract',
      'curl -fSL "https://github.com/koalaman/shellcheck/releases/download/v{{version}}/shellcheck-v{{version}}.${ASSET}.tar.xz" | tar xJ -C /tmp/shellcheck-extract',
      'install -Dm755 /tmp/shellcheck-extract/shellcheck-v{{version}}/shellcheck {{prefix}}/bin/shellcheck',
    ],
  },

  test: {
    script: [
      'shellcheck --version',
    ],
  },
}
