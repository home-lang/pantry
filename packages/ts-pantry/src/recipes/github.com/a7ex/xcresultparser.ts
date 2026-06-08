import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/a7ex/xcresultparser",
  platforms: ['darwin'],
  name: "xcresultparser",
  programs: [
    "xcresultparser",
  ],
  buildDependencies: {
    'crates.io/semverator': "*",
  },
  distributable: {
    url: "git+https://github.com/a7ex/xcresultparser.git",
  },
  build: {
    script: [
      {
        run: "SWIFT_TOOLS=$(grep swift-tools Package.swift | sed 's/.*: //')\nSWIFT_VERSION=$(swift --version 2>&1 | sed -n 's/.*Swift version \\([0-9]*\\.[0-9]*\\).*/\\1/p')\nif semverator gt $SWIFT_TOOLS $SWIFT_VERSION; then\n  sed -i \"s/swift-tools-version: $SWIFT_TOOLS/swift-tools-version: $SWIFT_VERSION/\" Package.swift\nfi\n",
      },
      "swift build -c release --disable-sandbox --arch $(uname -m)",
      "install -D .build/release/xcresultparser {{prefix}}/bin/xcresultparser",
    ],
  },
  test: {
    script: [
      "xcresultparser --version | grep {{version}}",
      "if test \"$(sw_vers -productVersion | cut -d . -f 1)\" -lt 15; then\n  echo \"Xcode too old; skipping.\"\n  exit 0\nfi\n",
      "curl -L \"${TESTDATA}\" | tar -xz",
      "xcresultparser -o txt SanityResults.xcresult > output.txt",
      "cat output.txt | grep 'Number of tests = 1'",
    ],
  },
}
