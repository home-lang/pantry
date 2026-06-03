import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'terraform.io/cdk',
  name: 'cdk',
  programs: [
    'cdktf',
  ],
  dependencies: {
    'nodejs.org': '^17 || ^18 || ^19 || ^20',
  },
  buildDependencies: {
    'classic.yarnpkg.com': '*',
  },
  distributable: {
    url: 'https://registry.npmjs.org/cdktf-cli/-/cdktf-cli-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p "{{prefix}}"',
      'npm_config_build_from_source=true yarn install --modules-folder {{prefix}}/node_modules',
      'cp -r bundle/bin package.json {{prefix}}',
    ],
  },
}
