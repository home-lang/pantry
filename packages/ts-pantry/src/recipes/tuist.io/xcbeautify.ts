import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "tuist.io/xcbeautify",
  name: "xcbeautify",
  programs: [
    "xcbeautify",
  ],
  distributable: {
    url: "https://github.com/tuist/xcbeautify/archive/refs/tags/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "export TMPDIR=$(mktemp -d)",
      {
        run: "echo 'let version = \{{version}}\' > Sources/xcbeautify/Version.swift",
        if: ">=0.21.0",
      },
      {
        run: "SWIFT_VERSION=\"$(swift --version | head -n1 | sed -E 's/.*Swift version ([0-9]+\\.[0-9]+).*/\\1/')\"\nsed -i \"s/swift-tools-version:.*/swift-tools-version:$SWIFT_VERSION/\" Package.swift\nsed -i 's|\\(.*StrictConcurrency\\)|//\\1|' Package.swift",
        if: "darwin",
      },
      "make install",
    ],
    env: {
      PREFIX: {{prefix}},
    },
  },
  test: {
    script: [
      "if test \{{version.major}}\ -ge 3 && test \"$(sw_vers -productVersion | cut -d . -f 1)\" -lt 14; then\n  exit 0\nfi\n",
      "xcbeautify --version | grep {{version}}",
    ],
  },
}
