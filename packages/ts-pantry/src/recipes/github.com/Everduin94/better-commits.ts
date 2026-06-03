import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/Everduin94/better-commits",
  name: "better-commits",
  programs: [
    "bcommits",
    "better-branch",
    "better-commits",
    "better-commits-init",
    "git-bc",
  ],
  dependencies: {
    'nodejs.org': "^20",
  },
  buildDependencies: {
    'npmjs.com': "^10",
  },
  distributable: {
    url: "https://registry.npmjs.org/better-commits/-/better-commits-{{version}}.tgz",
    stripComponents: 1,
  },
  build: {
    script: [
      "npm i $ARGS .",
      {
        run: "ln -s ../libexec/bin/bcommits bcommits\nln -s ../libexec/bin/better-branch better-branch\nln -s ../libexec/bin/better-commits better-commits\nln -s ../libexec/bin/better-commits-init better-commits-init\nln -s ../libexec/bin/git-bc git-bc\n",
        'working-directory': {{prefix}}/bin,
      },
    ],
    env: {
      ARGS: [
        "-ddd",
        "--global",
        "--build-from-source",
        "--prefix={{prefix}}/libexec",
        "--install-links",
        "--unsafe-perm",
      ],
    },
  },
  test: {
    script: [
      "git init",
      "better-commits-init",
      "cat .better-commits.json | grep 'A code change that neither fixes a bug nor adds a feature'",
      "cat .better-commits.jsonc | grep 'A code change that neither fixes a bug nor adds a feature'",
    ],
  },
}
