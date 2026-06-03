import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "expo.dev/eas-cli",
  name: "eas-cli",
  programs: [
    "eas",
  ],
  dependencies: {
    'nodejs.org': "^18.18 || >=20",
  },
  buildDependencies: {
    'python.org': "~3.10",
    'yarnpkg.com': ">=4.12",
    linux: {
      'gnu.org/gcc': "*",
    },
  },
  distributable: {
    url: "https://github.com/expo/eas-cli/archive/refs/tags/v{{version.raw}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "mkdir -p {{prefix}}",
      {
        run: "sed -i '1,10s/\"version\": \".*\"/\"version\": {{version}}/' package.json\n",
        'working-directory': "packages/eas-cli",
      },
      "yarn install",
      {
        run: "BUILD_CMD=\"build-ci\"",
        if: "<6",
      },
      {
        run: "BUILD_CMD=\"build\"",
        if: ">=6",
      },
      {
        run: "yarn $BUILD_CMD",
        if: "<18.0.1",
        'working-directory': "packages/eas-json/",
      },
      "yarn $BUILD_CMD",
      "cp -r * {{prefix}}",
      {
        run: "ln -s ../packages/eas-cli/bin/run bin/eas",
        'working-directory': "${{prefix}}",
      },
    ],
  },
  test: {
    script: [
      "eas",
      "eas --help",
      "eas --version",
      "eas --version | grep {{version}}",
      "eas autocomplete zsh",
    ],
  },
}
