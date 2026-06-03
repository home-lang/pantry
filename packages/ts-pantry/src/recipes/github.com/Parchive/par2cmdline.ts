import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/Parchive/par2cmdline",
  name: "par2cmdline",
  programs: [
    "par2",
    "par2create",
    "par2verify",
    "par2repair",
  ],
  distributable: {
    url: "https://github.com/Parchive/par2cmdline/releases/download/{{version.tag}}/par2cmdline-{{version}}.tar.bz2",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure --prefix=\"{{prefix}}\"",
      "make --jobs {{hw.concurrency}} install",
      {
        run: "ln -sf par2 par2create\nln -sf par2 par2verify\nln -sf par2 par2repair",
        'working-directory': "{{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "cp $FIXTURE test.txt",
      "par2 create -r100 test.txt",
      "echo foo > test.txt",
      "test \"$(cat test.txt)\" = \"foo\"",
      "! par2 verify test.txt.par2",
      "par2 repair test.txt.par2",
      "par2 verify test.txt.par2",
      "test \"$(cat test.txt)\" = \"this is pkgx\"",
    ],
  },
}
