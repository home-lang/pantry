import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/nektos/act",
  name: "act",
  programs: [
    "act",
  ],
  buildDependencies: {
    'go.dev': "*",
  },
  distributable: {
    url: "https://github.com/nektos/act/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i.bak 's/-ldflags \"/-ldflags \"-buildmode=pie /' Makefile\nrm Makefile.bak\n",
        if: "linux",
      },
      "make build VERSION={{version}}",
      {
        run: "cp $SRCROOT/dist/local/act .\nchmod 755 {{prefix}}/bin/act\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "git clone https://github.com/pkgxdev/setup.git",
      "cd setup",
      "git checkout v0.15.0",
      "act push --list",
    ],
  },
}
