import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'casdoor.org',
  name: 'casdoor',
  programs: ['casdoor'],
  versionSource: {
    type: 'github-releases',
    repo: 'casdoor/casdoor',
  },
  distributable: {
    url: 'https://github.com/casdoor/casdoor/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'nodejs.org': '18.19.0',
    'classic.yarnpkg.com': '^1',
  },

  build: {
    script: [
      'cd "web"',
      'yarn install --frozen-lockfile --network-timeout 1000000',
      'NODE_OPTIONS="--max-old-space-size=4096" yarn run build',
      '',
      'cd "${BUILD_DIR}"',
      'mkdir -p ${FRONTEND_PATH}',
      'cp -R . ${FRONTEND_PATH}',
      '',
      'go build ${GO_ARGS} -ldflags="${GO_LDFLAGS}" ./',
      'cd "conf"',
      'mkdir -p ${SAMPLE_CONFIG_PATH}',
      'cp ${PWD}/app.conf ${SAMPLE_CONFIG_PATH}',
      '',
    ],
    env: {
      'BUILD_DIR': 'web/build',
      'FRONTEND_PATH': '{{prefix}}/${BUILD_DIR}',
      'SAMPLE_CONFIG_PATH': '{{prefix}}/etc/casdoor',
      'CGO_ENABLED': '0',
      'GO_ARGS': ['-o "{{prefix}}/bin/"'],
      'GO_LDFLAGS': ['-s', '-w'],
    },
  },
}
