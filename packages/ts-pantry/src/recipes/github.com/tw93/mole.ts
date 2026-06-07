import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/tw93/mole',
  name: 'mole',
  programs: [
    'mole',
    'mo',
  ],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'tw93/mole',
    tagPattern: /^V(.+)$/,
  },
  distributable: null,
  build: {
    script: [
      'case {{hw.arch}} in',
      '  aarch64) ARCH=arm64 ;;',
      '  x86-64) ARCH=amd64 ;;',
      '  *) echo "unsupported arch {{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl --fail --location --retry 3 --retry-delay 2 --connect-timeout 15 --max-time 300 -o mole.tar.gz "https://github.com/tw93/mole/archive/refs/tags/V{{version}}.tar.gz"',
      'mkdir source',
      'tar -xzf mole.tar.gz -C source --strip-components=1',
      'mkdir -p {{prefix}}/bin {{prefix}}/libexec/mole',
      'cp -R source/bin source/lib source/mole {{prefix}}/libexec/mole/',
      'for PROGRAM in analyze status; do',
      '  curl --fail --location --retry 3 --retry-delay 2 --connect-timeout 15 --max-time 300 -o "$PROGRAM-darwin-$ARCH" "https://github.com/tw93/mole/releases/download/V{{version}}/$PROGRAM-darwin-$ARCH"',
      '  install -m755 "$PROGRAM-darwin-$ARCH" "{{prefix}}/libexec/mole/bin/$PROGRAM-go"',
      'done',
      'chmod -R u+rwX,go+rX {{prefix}}/libexec/mole',
      "cat > {{prefix}}/bin/mole <<'EOF'",
      '#!/bin/sh',
      'exec "{{prefix}}/libexec/mole/mole" "$@"',
      'EOF',
      'chmod 755 {{prefix}}/bin/mole',
      'ln -sf mole {{prefix}}/bin/mo',
    ],
    skip: ['verify-foreign-artifact'],
  },
  test: {
    script: [
      'mole --version | grep "{{version}}"',
      'mo --version | grep "{{version}}"',
      'test -x {{prefix}}/libexec/mole/bin/analyze-go',
      'test -x {{prefix}}/libexec/mole/bin/status-go',
    ],
  },
}
