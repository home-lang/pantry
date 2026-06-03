import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "sourceware.org/bzip2",
  name: "bzip2",
  programs: [
    "bunzip2",
    "bzcat",
    "bzcmp",
    "bzdiff",
    "bzgrep",
    "bzegrep",
    "bzfgrep",
    "bzip2",
    "bzip2recover",
    "bzmore",
    "bzless",
  ],
  distributable: {
    url: "https://sourceware.org/pub/bzip2/bzip2-{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "make --environment-overrides",
      "make --environment-overrides install",
      {
        run: "for x in *; do\n  if [ -L $x ]; then\n    y=\"$(readlink $x)\"\n    rm $x\n    ln -s $(basename \"$y\") $x\n  fi\ndone\n",
        'working-directory': "{{prefix}}/bin",
      },
      {
        run: "make \\\n  --file Makefile-libbz2_so \\\n  --environment-overrides \\\n  --jobs {{ hw.concurrency }}\n\nmv libbz2.*.1.* {{ prefix }}/lib\ncd {{ prefix }}/lib\ntest -e libbz2.so || ln -s libbz2.so.{{ version }} libbz2.so\ntest -e libbz2.so.{{ version.major }} || ln -s libbz2.so.{{ version }} libbz2.so.{{ version.major }}\n",
        if: "linux",
      },
      {
        run: "# necessary until brewkit v1\nif [ -n \"$(ls {{ prefix }}/lib/*.dylib)\" ]; then\n  rm {{ prefix }}/lib/*.dylib\nfi\n\nmake \\\n  --file props/Makefile-libbz2_dylib \\\n  --environment-overrides \\\n  --jobs {{ hw.concurrency }}\n\ncd {{ prefix }}/lib\ntest -e libbz2.dylib\ntest -e libbz2.{{version}}.dylib\nln -s libbz2.{{version}}.dylib libbz2.{{version.major}}.dylib\n",
        if: "darwin",
      },
    ],
    env: {
      PREFIX: "${{ prefix }}",
      darwin: {
        PKG_VERSION: "${{ version }}",
      },
    },
  },
  test: {
    script: [
      "OUT=$(echo \"$INPUT\" | bzip2 | bunzip2)\ntest \"$OUT\" = \"$INPUT\"\n",
      "echo \"$INPUT\" > file\nbzip2 file\nbzegrep test-string file.bz2\n",
    ],
  },
}
