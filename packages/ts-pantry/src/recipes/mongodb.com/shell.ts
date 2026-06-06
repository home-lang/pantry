import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mongodb.com/shell',
  name: 'shell',
  programs: [
    'mongosh',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'mongodb-js/mongosh',
  },
  // Prebuilt download: mongosh ships official per-platform archives
  // (`mongosh-<ver>-<os>-<arch>.zip|.tgz`) from downloads.mongodb.com. Each archive
  // has a top-level `mongosh-<ver>-<os>-<arch>/bin/` dir with the `mongosh` binary
  // plus the `mongosh_crypt_v1.{dylib,so}` shared lib it loads at runtime — install
  // both. This replaces the slow, fragile `npm i --build-from-source` source build.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin-arm64"; EXT="zip" ;;',
      '  darwin+x86-64)  ASSET="darwin-x64";   EXT="zip" ;;',
      '  linux+aarch64)  ASSET="linux-arm64";  EXT="tgz" ;;',
      '  linux+x86-64)   ASSET="linux-x64";    EXT="tgz" ;;',
      'esac',
      '',
      'URL="https://downloads.mongodb.com/compass/mongosh-${VERSION}-${ASSET}.${EXT}"',
      'curl -Lfo "mongosh.${EXT}" "$URL"',
      'if [ "$EXT" = "zip" ]; then unzip -o "mongosh.${EXT}"; else tar xzf "mongosh.${EXT}"; fi',
      '',
      'DIR="mongosh-${VERSION}-${ASSET}"',
      'install -Dm755 "${DIR}/bin/mongosh" {{prefix}}/bin/mongosh',
      'for lib in "${DIR}/bin/"mongosh_crypt_v1.*; do',
      '  install -Dm755 "$lib" "{{prefix}}/bin/$(basename "$lib")"',
      'done',
    ],
  },

  test: {
    script: [
      'mongosh --version | grep {{version}}',
      'mongosh --nodb --eval "print(\'#ok#\')" | grep \'#ok#\'',
    ],
  },
}
