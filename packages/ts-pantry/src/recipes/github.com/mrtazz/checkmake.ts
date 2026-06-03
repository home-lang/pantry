import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/mrtazz/checkmake",
  name: "checkmake",
  programs: [
    "checkmake",
  ],
  buildDependencies: {
    'go.dev': "^1.21",
  },
  distributable: {
    url: "https://github.com/mrtazz/checkmake/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "BIN_PATH=./",
        if: "<0.3",
      },
      {
        run: "BIN_PATH=./cmd/checkmake",
        if: ">=0.3",
      },
      "go build $ARGS -ldflags=\"$GO_LDFLAGS\" $BIN_PATH",
    ],
    env: {
      ARGS: [
        "-trimpath",
        "-o={{prefix}}/bin/checkmake",
        "-mod=mod",
      ],
      GO_LDFLAGS: [
        "-s",
        "-w",
        "-X 'main.version={{version}}'",
        "-X 'main.goversion=go{{deps.go.dev.version}}'",
        "-X 'main.buildTime=$(date)'",
        "-X 'main.builder=pkgx'",
      ],
      linux: {
        GO_LDFLAGS: [
          "-buildmode=pie",
        ],
      },
    },
  },
  test: {
    script: [
      "checkmake --version | grep {{version}}",
      "(checkmake $FIXTURE || true) 2>&1 | tee out",
      "grep 'Missing required phony target' out",
      "grep \"Error: violations found\" out\ngrep \"Required target\" out\ngrep \"declared PHONY\" out\ngrep -F \"PHONY.\" out",
    ],
  },
}
