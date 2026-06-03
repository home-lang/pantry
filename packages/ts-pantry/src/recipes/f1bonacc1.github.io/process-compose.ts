import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "f1bonacc1.github.io/process-compose",
  name: "process-compose",
  programs: [
    "process-compose",
  ],
  buildDependencies: {
    'go.dev': "=1.24.2",
  },
  distributable: {
    url: "https://github.com/F1bonacc1/process-compose/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "go build $ARGS -ldflags=\"$GO_LDFLAGS\" ./src",
        if: "<1.85",
      },
      {
        run: "go build $ARGS -ldflags=\"$GO_LDFLAGS\" .",
        if: ">=1.85",
      },
    ],
    env: {
      COMMIT: "$(git describe --always --abbrev=8 --dirty)",
      DATE: "$(date -u +%FT%TZ)",
      ARGS: [
        "-trimpath",
        "-o={{prefix}}/bin/process-compose",
      ],
      GO_LDFLAGS: [
        "-s",
        "-w",
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
      "cp $FIXTURE process-compose.yaml",
      "SETTINGS=\"$(process-compose info | sed '/^Settings/!d;s/^Settings. *//')\"",
      "if test -n \"$SETTINGS\"; then\n  mkdir -p \"$(dirname \"$SETTINGS\")\"\n  touch \"$SETTINGS\"\nfi\n",
      "process-compose up",
    ],
  },
}
