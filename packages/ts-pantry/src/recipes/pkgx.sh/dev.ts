import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "pkgx.sh/dev",
  name: "dev",
  programs: [
    "dev",
  ],
  dependencies: {
    'pkgx.sh': "^1,^2.1",
  },
  distributable: {
    url: "https://github.com/pkgxdev/dev/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "echo 'export default \"{{version}}\"' > ./src/app-version.ts",
      "mkdir -p {{prefix}}/bin {{prefix}}/share/pkgx/dev",
      "cp -r ./app.ts src deno.json deno.lock {{prefix}}/share/pkgx/dev",
      {
        // The launcher shebang was an inline pkgx prop ($PROP) that was lost in
        // the port, so `cp $PROP` had nothing to copy. Restore it.
        run: "cp $PROP {{prefix}}/bin/dev\nchmod +x {{prefix}}/bin/dev",
        prop: [
          '#!/bin/sh',
          'd="$(cd "$(dirname $0)"/.. && pwd)"',
          'exec "$d/share/pkgx/dev/app.ts" "$@"',
        ].join('\n'),
      },
    ],
  },
  test: {
    script: [
      "which pkgx",
      "which deno && exit 1",
      "eval \"$(dev --shellcode)\"",
      "echo '{}' > deno.json",
      "dev",
      "deno --version",
      "test \"$(dev --version)\" = 'dev {{version}}'",
    ],
  },
}
