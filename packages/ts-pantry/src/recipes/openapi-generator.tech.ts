import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'openapi-generator.tech',
  name: 'openapi-generator',
  description: 'OpenAPI Generator allows generation of API client libraries (SDK generation), server stubs, documentation and configuration automatically given an OpenAPI Spec (v2, v3)',
  homepage: 'https://openapi-generator.tech/',
  github: 'https://github.com/OpenAPITools/openapi-generator',
  programs: ['', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'OpenAPITools/openapi-generator',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/OpenAPITools/openapi-generator.git',
  },

  build: {
    script: [
      'mvn clean package -Dmaven.javadoc.skip=true',
      'install -D modules/openapi-generator-cli/target/openapi-generator-cli.jar {{prefix}}/libexec/lib/openapi-generator-cli.jar',
      'run: |',
      'cp $FIXTURE minimal.yaml',
      'openapi-generator generate -i minimal.yaml -g openapi -o out',
      'openapi-generator generate -i minimal.yaml -g python -o out',
      'ls out | grep openapi.json',
      'ls out | grep setup.py',
      'openapi-generator --version | grep {{version}}',
    ],
  },
}
