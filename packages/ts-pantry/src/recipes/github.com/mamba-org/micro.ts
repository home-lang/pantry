import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mamba-org/micro',
  name: 'micro',
  programs: [
    'micromamba',
  ],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64', 'linux/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'mamba-org/micromamba-releases',
    tagPattern: /^(\d+\.\d+\.\d+)-\d+$/,
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  distributable: null,
  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PID=osx-arm64 ;;',
      '  darwin+x86-64) PID=osx-64 ;;',
      '  linux+x86-64) PID=linux-64 ;;',
      '  linux+aarch64) PID=linux-aarch64 ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'TAG="{{version}}-0"',
      'ASSET="micromamba-${PID}.tar.bz2"',
      'curl -Lfo "$ASSET" "https://github.com/mamba-org/micromamba-releases/releases/download/${TAG}/$ASSET"',
      'tar -xjf "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 bin/micromamba {{prefix}}/bin/micromamba',
    ],
  },
  test: {
    script: [
      'micromamba --version | grep {{version}}',
    ],
  },
}
