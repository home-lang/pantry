import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'amber-lang.com',
  name: 'amber',
  description: 'Crystal web framework. Bare metal performance, productivity and happiness',
  homepage: 'https://amberframework.org/',
  github: 'https://github.com/amber-lang/amber',
  programs: ['amber'],
  versionSource: {
    type: 'github-releases',
    repo: 'amber-lang/amber',
    tagPattern: /^(.+)$/,
  },
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="amber-macos-aarch64" ;;',
      '  darwin+x86-64)  ASSET="amber-macos-x86_64" ;;',
      '  linux+aarch64)  ASSET="amber-linux-gnu-aarch64" ;;',
      '  linux+x86-64)   ASSET="amber-linux-gnu-x86_64" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo amber.tar.xz "https://github.com/amber-lang/amber/releases/download/${VERSION}/${ASSET}.tar.xz"',
      'tar Jxf amber.tar.xz',
      'mkdir -p {{prefix}}/bin',
      'install -m755 amber {{prefix}}/bin/amber',
    ],
  },
  test: {
    script: [
      'amber --version | grep "{{version}}"',
    ],
  },
}
