import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/fiatjaf/nak",
  name: "nak",
  programs: [
    "nak",
  ],
  buildDependencies: {
    'go.dev': "~1.25",
    linux: {
      'gnu.org/gcc': "*",
      'github.com/libfuse/libfuse': '2',
    },
    darwin: {
      'macfuse.github.io/v2': "*",
    },
  },
  distributable: {
    url: "https://github.com/fiatjaf/nak/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "go mod download",
      {
        run: "go get fiatjaf.com/nostr/sdk@v0.0.0-20250610194330-027d016d9706",
        if: "0.14.3",
      },
      "go build -v -trimpath -ldflags=\"$GO_LDFLAGS\" -o {{prefix}}/bin/nak .",
    ],
    env: {
      GO_LDFLAGS: [
        "-s",
        "-w",
        "-X main.version=v{{version}}",
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
      "nak --version",
      "test \"$(nak --version)\" = \"nak version v{{version}}\"",
      "mkdir -p ~/.config/nak/outbox\ntouch ~/.config/nak/outbox/hints.bg",
      "nak event > out",
      "nak verify <out",
    ],
  },
}
