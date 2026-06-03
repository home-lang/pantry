import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/p7zip-project/p7zip",
  name: "p7zip",
  programs: [
    "7z",
    "7za",
    "7zr",
  ],
  distributable: {
    url: "https://github.com/p7zip-project/p7zip/archive/v{{version.raw}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "mv makefile.macosx_llvm_64bits makefile.machine",
        if: "darwin",
      },
      {
        run: "mv makefile.linux_any_cpu makefile.machine\nsed -i.bak -e 's/-std=gnu/-fPIC -std=gnu/' \\\n  C/makefile.glb \\\n  CPP/7zip/CMAKE/CMakeLists.txt \\\n  makefile.glb\nrm C/makefile.glb.bak \\\n  CPP/7zip/CMAKE/CMakeLists.txt.bak \\\n  makefile.glb.bak\n",
        if: "linux",
      },
      "make --jobs {{ hw.concurrency }} all3",
      "make DEST_HOME={{prefix}} DEST_MAN={{prefix}}/man install",
      {
        run: "for x in *; do\n  echo \"#!/bin/sh\" > $x\n  echo 'd=\"$(cd \"$(dirname \"$0\")/..\" && pwd)\"' >> $x\n  echo \"exec \\\"\\$d\\\"/lib/p7zip/$x \\\"\\$@\\\"\" >> $x\ndone\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "7z a -t7z foo.7z $FIXTURE",
      "7z e foo.7z -oout",
      "test \"hello world!\" = \"$(cat out/*)\"",
    ],
  },
}
