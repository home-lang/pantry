import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/jesseduffield/horcrux",
  name: "horcrux",
  programs: [
    "horcrux",
  ],
  buildDependencies: {
    'go.dev': "^1.14",
  },
  distributable: {
    url: "https://github.com/jesseduffield/horcrux/archive/refs/tags/v{{version.raw}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "go mod download",
      {
        run: "sed -i.bak 's/Split(path, path, total, threshold)/Split(path, filepath.Dir(path), total, threshold)/' split.go\nrm split.go.bak\n",
        'working-directory': "pkg/commands",
      },
      "go build -v -trimpath -ldflags=\"$LDFLAGS\" -o $BUILDLOC .",
    ],
    env: {
      GOPROXY: "https://proxy.golang.org,direct",
      GOSUMDB: "sum.golang.org",
      GO111MODULE: "on",
      CGO_ENABLED: 0,
      BUILDLOC: {{prefix}}/bin/horcrux,
      LDFLAGS: [
        "-s",
        "-w",
      ],
      linux: {
        LDFLAGS: [
          "-buildmode=pie",
        ],
      },
    },
  },
  test: {
    script: [
      "cp $FIXTURE tea.txt",
      "horcrux -t 3 -n 5 split tea.txt",
      "rm tea.txt tea_1_of_5.horcrux tea_4_of_5.horcrux",
      "horcrux bind",
      "cmp tea.txt $FIXTURE",
    ],
  },
}
