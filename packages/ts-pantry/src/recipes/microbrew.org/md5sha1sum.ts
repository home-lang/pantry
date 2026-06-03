import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "microbrew.org/md5sha1sum",
  name: "md5sha1sum",
  programs: [
    "md5sum",
    "sha1sum",
    "ripemd160sum",
  ],
  dependencies: {
    'openssl.org': "^1.1",
  },
  distributable: {
    url: "http://microbrew.org/tools/md5sha1sum/md5sha1sum-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure --prefix={{prefix}}",
      "make --jobs={{hw.concurrency}}",
      "install -D md5sum {{prefix}}/bin/md5sum",
      {
        run: "ln -s md5sum sha1sum\nln -s md5sum ripemd160sum\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      SSLINCPATH: "${{deps.openssl.org.prefix}}/include",
      SSLLIBPATH: "${{deps.openssl.org.prefix}}/lib",
    },
  },
  test: {
    script: [
      "echo \"Hello, world!\" > test.txt",
      "md5sum test.txt > test.txt.md5",
      "sha1sum test.txt > test.txt.sha1",
      "ripemd160sum test.txt > test.txt.ripemd160",
      "md5sum -c test.txt.md5 | grep OK",
      "sha1sum -c test.txt.sha1 | grep OK",
      "ripemd160sum -c test.txt.ripemd160 | grep OK",
    ],
  },
}
