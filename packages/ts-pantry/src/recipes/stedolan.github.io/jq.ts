import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "stedolan.github.io/jq",
  name: "jq",
  // jq moved from stedolan/jq to jqlang/jq; the github field also lets the tag
  // resolver map trailing-.0 versions (1.7.0) onto their real tag (jq-1.7).
  github: "https://github.com/jqlang/jq",
  programs: [
    "jq",
  ],
  // Prebuilt download: jq ships official per-platform release binaries
  // (statically linked, so no runtime oniguruma needed). Asset naming changed
  // at jq-1.7: 1.7+ ship jq-<os>-<arch> (incl. native macos-arm64 / linux-arm64),
  // while 1.6 and earlier only ship jq-osx-amd64 / jq-linux64 (no arm64) under a
  // major.minor tag (jq-1.6). version.tag is the API-resolved real tag.
  distributable: null,
  build: {
    script: [
      "TAG={{version.tag}}",
      "MAJOR={{version.major}}",
      "MINOR={{version.minor}}",
      "if [ \"$MAJOR\" -eq 1 ] && [ \"$MINOR\" -le 6 ]; then",
      "  case {{hw.platform}}+{{hw.arch}} in",
      "    darwin+x86-64) ASSET=\"jq-osx-amd64\" ;;",
      "    linux+x86-64)  ASSET=\"jq-linux64\"   ;;",
      "    *) echo \"jq ${TAG} has no prebuilt binary for {{hw.platform}}/{{hw.arch}} (arm64 added in 1.7)\" && exit 1 ;;",
      "  esac",
      "else",
      "  case {{hw.platform}}+{{hw.arch}} in",
      "    darwin+aarch64) ASSET=\"jq-macos-arm64\" ;;",
      "    darwin+x86-64)  ASSET=\"jq-macos-amd64\" ;;",
      "    linux+aarch64)  ASSET=\"jq-linux-arm64\" ;;",
      "    linux+x86-64)   ASSET=\"jq-linux-amd64\" ;;",
      "  esac",
      "fi",
      "",
      "curl -Lfo jq \"https://github.com/jqlang/jq/releases/download/${TAG}/${ASSET}\"",
      "install -Dm755 jq {{prefix}}/bin/jq",
    ],
  },
  test: {
    script: [
      "test \"$(echo '{\"a\":42}' | jq .a)\" = \"42\"",
    ],
  },
}
