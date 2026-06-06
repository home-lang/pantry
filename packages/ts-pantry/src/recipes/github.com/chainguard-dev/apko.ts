import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/chainguard-dev/apko',
  name: 'apko',
  programs: [
    'apko',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'chainguard-dev/apko',
  },
  // Prebuilt download: apko ships official per-platform release tarballs.
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) OS=darwin; ARCH=arm64 ;;',
      '  darwin+x86-64)  OS=darwin; ARCH=amd64 ;;',
      '  linux+aarch64)  OS=linux;  ARCH=arm64 ;;',
      '  linux+x86-64)   OS=linux;  ARCH=amd64 ;;',
      'esac',
      '',
      'DIR="apko_${VERSION}_${OS}_${ARCH}"',
      'curl -Lfo apko.tar.gz "https://github.com/chainguard-dev/apko/releases/download/v${VERSION}/${DIR}.tar.gz"',
      'tar xzf apko.tar.gz',
      'install -Dm755 "${DIR}/apko" {{prefix}}/bin/apko',
    ],
  },
  test: {
    script: [
      'apko version',
      'apko version | grep \'{{version}}\'',
    ],
  },
}
