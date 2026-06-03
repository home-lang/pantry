import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/10gic/vanitygen-plusplus",
  name: "vanitygen-plusplus",
  programs: [],
  dependencies: {
    'openssl.org': "^1.1",
    'curl.se': "^8",
    'pcre.org': "^8",
  },
  distributable: {
    url: "https://github.com/10gic/vanitygen-plusplus/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "make all\ninstall -D oclvanityminer '{{prefix}}/bin/oclvanityminer'\ninstall -D oclvanitygen++ '{{prefix}}/bin/oclvanitygen++'",
        if: "darwin",
      },
      {
        run: "make most",
        if: "linux",
      },
      "install -D vanitygen++ '{{prefix}}/bin/vanitygen++'",
      "install -D keyconv '{{prefix}}/bin/keyconv'",
    ],
  },
}
