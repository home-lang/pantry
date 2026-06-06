import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'render.com',
  name: 'render',
  description: 'Command-line interface for Render',
  homepage: 'https://render.com/docs/cli',
  github: 'https://github.com/render-oss/render-cli-deprecated',
  programs: ['render'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'render-oss/render-cli',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET=render-macos-aarch64 ;;',
      '  darwin+x86-64) ASSET=render-macos-x86_64 ;;',
      '  linux+x86-64) ASSET=render-linux-x86_64 ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}} (upstream ships darwin/aarch64, darwin/x86-64, and linux/x86-64 only)" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo render "https://github.com/render-oss/render-cli-deprecated/releases/download/v{{version}}/$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 render {{prefix}}/bin/render',
    ],
  },
  test: {
    script: [
      'test -s {{prefix}}/bin/render',
      'test -x {{prefix}}/bin/render',
    ],
  },
}
