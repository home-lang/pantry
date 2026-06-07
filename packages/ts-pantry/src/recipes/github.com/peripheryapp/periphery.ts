import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/peripheryapp/periphery',
  name: 'periphery',
  // periphery is a Swift package; the Swift toolchain (swift.org) is darwin-only
  // in this pantry, and pkgx marks this project darwin-only as well.
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  programs: [
    'periphery',
  ],
  dependencies: {
    'curl.se': '*',
    'gnome.org/libxml2': '*',
  },
  buildDependencies: {
    'swift.org': '>=5.10',
  },
  distributable: {
    url: 'https://github.com/peripheryapp/periphery/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'make build_release\ninstall -Dt {{prefix}}/bin $(make show_bin_path)',
        if: '<3',
      },
      {
        run: 'swift build $SWIFT_ARGS\ninstall -Dt {{prefix}}/bin .build/release/periphery',
        if: '>=3',
      },
    ],
    env: {
      SWIFT_ARGS: [
        '--configuration release',
        '--product periphery',
      ],
      linux: {
        SWIFT_ARGS: [
          '--static-swift-stdlib',
        ],
      },
      darwin: {
        SWIFT_ARGS: [
          '--disable-sandbox',
        ],
      },
    },
  },
}
