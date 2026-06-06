import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'getsynth.com',
  name: 'synth',
  description: 'The Declarative Data Generator',
  homepage: 'https://www.getsynth.com/',
  github: 'https://github.com/shuttle-hq/synth',
  programs: ['synth'],
  platforms: ['darwin/x86-64', 'linux'],
  versionSource: {
    type: 'github-releases',
    repo: 'shuttle-hq/synth',
    tagPattern: /^v(.+)$/,
  },
  // Prebuilt download: Synth ships official release tarballs for linux
  // x86-64/aarch64 and macOS x86-64. There is no macOS arm64 asset.
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+x86-64)  ASSET=synth-macos-latest-x86_64.tar.gz ;;',
      '  linux+aarch64)  ASSET=synth-ubuntu-latest-arm64.tar.gz ;;',
      '  linux+x86-64)   ASSET=synth-ubuntu-latest-x86_64.tar.gz ;;',
      'esac',
      '',
      'curl -Lfo synth.tar.gz "https://github.com/shuttle-hq/synth/releases/download/v{{version}}/${ASSET}"',
      'tar xzf synth.tar.gz',
      'install -Dm755 synth {{prefix}}/bin/synth',
    ],
  },
  test: {
    script: [
      'synth --version',
    ],
  },
}
