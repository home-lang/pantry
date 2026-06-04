import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "stedolan.github.io/jq",
  name: "jq",
  programs: [
    "jq",
  ],
  // Prebuilt download: jq ships official per-platform release binaries
  // (statically linked, so no runtime oniguruma needed).
  distributable: null,
  build: {
    script: [
      "VERSION={{version.raw}}",
      "case {{hw.platform}}+{{hw.arch}} in",
      "  darwin+aarch64) ASSET=\"jq-macos-arm64\" ;;",
      "  darwin+x86-64)  ASSET=\"jq-macos-amd64\" ;;",
      "  linux+aarch64)  ASSET=\"jq-linux-arm64\" ;;",
      "  linux+x86-64)   ASSET=\"jq-linux-amd64\" ;;",
      "esac",
      "",
      "curl -Lfo jq \"https://github.com/jqlang/jq/releases/download/jq-${VERSION}/${ASSET}\"",
      "install -Dm755 jq {{prefix}}/bin/jq",
    ],
  },
  test: {
    script: [
      "test \"$(echo '{\"a\":42}' | jq .a)\" = \"42\"",
    ],
  },
}
