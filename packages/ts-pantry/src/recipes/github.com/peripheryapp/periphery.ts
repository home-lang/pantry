import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/peripheryapp/periphery",
  name: "periphery",
  programs: [
    "periphery",
  ],
  dependencies: {
    'curl.se': "*",
    'gnome.org/libxml2': "*",
  },
  distributable: {
    url: "https://github.com/peripheryapp/periphery/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "make build_release\ninstall -Dt {{prefix}}/bin $(make show_bin_path)",
        if: "<3",
      },
      {
        run: "swift build $SWIFT_ARGS\ninstall -Dt {{prefix}}/bin .build/release/periphery",
        if: ">=3",
      },
    ],
    env: {
      SWIFT_ARGS: [
        "--configuration release",
        "--product periphery",
      ],
      linux: {
        SWIFT_ARGS: [
          "--static-swift-stdlib",
        ],
      },
      darwin: {
        SWIFT_ARGS: [
          "--disable-sandbox",
        ],
      },
    },
  },
  test: {
    script: [
      "if ! test -f /usr/lib/swift/libswiftSynchronization.dylib; then\n  echo 'skipping test: missing libswiftSynchronization.dylib'\n  exit 0\nfi\n",
      "test \"$(periphery version)\" = {{version}}",
      "SWIFT_VERSION=$(swift --version 2>&1 | sed -n 's/.*Swift version \\([0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\\).*/\\1/p')",
      "if ! semverator satisfies '>=5.10' $SWIFT_VERSION; then\n  echo 'skipping test: swift version too old'\n  exit 0\n  fi\n",
      "swift package init --name test --type executable",
      "swift build --disable-sandbox",
      "swift package --disable-sandbox describe --type json | tee manifest.json",
      "periphery scan --strict --skip-build --json-package-manifest-path manifest.json",
    ],
  },
}
