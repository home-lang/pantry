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
        run: "cp $PROP {{prefix}}/bin/dev\nchmod +x {{prefix}}/bin/dev",
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
