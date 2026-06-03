import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crystal-lang.org/shards",
  name: "shards",
  programs: [
    "shards",
  ],
  dependencies: {
    'hboehm.info/gc': "^8",
    'pyyaml.org/libyaml': "^0",
    'crystal-lang.org': "*",
  },
  buildDependencies: {
    'curl.se': "*",
  },
  distributable: {
    url: "https://github.com/crystal-lang/shards/archive/refs/tags/v{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "curl -L https://github.com/crystal-lang/crystal-molinillo/archive/refs/tags/v0.2.0.tar.gz | \\\n  tar --strip-components=2 -zxf -\nmkdir -p \{{prefix}}/lib\\ncp -a molinillo molinillo.cr \{{prefix}}/lib\\n",
        'working-directory': ".molinillo",
      },
      {
        run: "sed -i.bak \\\n    -e 's/MOLINILLO_VERSION = .*$/MOLINILLO_VERSION = 0.2.0/' \\\n    Makefile\nrm Makefile.bak\n",
      },
      "make $ARGS bin/shards",
      "mkdir -p \{{prefix}}/bin\",
      "install bin/shards \{{prefix}}/bin\",
    ],
    env: {
      CRYSTAL_LINK_FLAGS: "-Wl,-rpath,{{prefix}}/../../..",
      CRYSTAL_PATH: "${{prefix}}/lib:$CRYSTAL_PATH",
      ARGS: [
        "release=true",
        "FLAGS=--no-debug",
        "CRYSTAL={{deps.crystal-lang.org.prefix}}/bin/crystal",
        "SHARDS=false",
      ],
    },
  },
  test: {
    script: [
      "out=($(shards --version))",
      "version=${out[1]}",
      "test $version = {{version}}",
    ],
  },
}
