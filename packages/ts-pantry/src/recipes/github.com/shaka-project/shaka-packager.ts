import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/shaka-project/shaka-packager',
  name: 'shaka-packager',
  programs: [
    'packager',
    'mpd_generator',
  ],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64', 'linux/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'shaka-project/shaka-packager',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,
  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) SUFFIX=osx-arm64 ;;',
      '  darwin+x86-64) SUFFIX=osx-x64 ;;',
      '  linux+x86-64) SUFFIX=linux-x64 ;;',
      '  linux+aarch64) SUFFIX=linux-arm64 ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'mkdir -p {{prefix}}/bin',
      'for PROGRAM in packager mpd_generator; do',
      '  ASSET="$PROGRAM-$SUFFIX"',
      '  curl --fail --location --retry 3 --retry-delay 2 --connect-timeout 15 --max-time 300 -o "$ASSET" "https://github.com/shaka-project/shaka-packager/releases/download/v{{version}}/$ASSET"',
      '  install -m755 "$ASSET" "{{prefix}}/bin/$PROGRAM"',
      'done',
    ],
  },
  test: {
    script: [
      'packager --version | grep "v{{version}}"',
      'mpd_generator --version | grep "v{{version}}"',
    ],
  },
}
