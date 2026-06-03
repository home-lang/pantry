import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "nodejs.org/corepack",
  name: "corepack",
  programs: [
    "corepack",
  ],
  dependencies: {
    'nodejs.org': "^22",
  },
  buildDependencies: {
    'npmjs.com': "*",
  },
  distributable: {
    url: "https://registry.npmjs.org/corepack/-/corepack-{{version}}.tgz",
    stripComponents: 1,
  },
  build: {
    script: [
      "npm install $ARGS",
    ],
    env: {
      ARGS: [
        "-ddd",
        "--global",
        "--build-from-source",
        "--prefix={{prefix}}",
        "--install-links",
        "--unsafe-perm",
      ],
    },
  },
  test: {
    script: [
      "corepack enable yarn",
      "echo '{\"name\": \"test\"}' > package.json\n",
      "yarn add jquery -y",
      "rm package.json",
      "corepack disable yarn",
      "corepack enable pnpm",
      "pnpm init",
      "ls | grep package.json",
    ],
  },
}
