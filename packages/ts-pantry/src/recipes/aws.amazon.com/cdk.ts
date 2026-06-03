import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'aws.amazon.com/cdk',
  name: 'cdk',
  programs: [
    'cdk',
  ],
  dependencies: {
    'nodejs.org': '*',
  },
  buildDependencies: {
    'npmjs.com': '*',
  },
  distributable: {
    url: 'https://registry.npmjs.org/aws-cdk/-/aws-cdk-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      'npm install $ARGS',
      'rm {{prefix}}/lib/node_modules/aws-cdk',
      'mkdir -p {{prefix}}/lib/node_modules/aws-cdk',
      'mv ./bin {{prefix}}/lib/node_modules/aws-cdk/',
      'mv ./lib {{prefix}}/lib/node_modules/aws-cdk/',
      {
        run: 'test -d test || mkdir test',
      },
      'mv ./test {{prefix}}/lib/node_modules/aws-cdk/',
      'mv ./package.json {{prefix}}/lib/node_modules/aws-cdk/',
      'mv ./build-info.json {{prefix}}/lib/node_modules/aws-cdk/',
    ],
    env: {
      ARGS: [
        '-ddd',
        '--global',
        '--build-from-source',
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'cdk --version | grep {{version}}',
    ],
  },
}
