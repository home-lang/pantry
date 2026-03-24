import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zotregistry.dev',
  name: 'zotregistry',
  github: 'https://github.com/project-zot/zot',
  programs: ['zb', 'zli', 'zot', 'zxp'],
  versionSource: {
    type: 'github-releases',
    repo: 'project-zot/zot',
  },
  distributable: {
    url: 'git+https://github.com/project-zot/zot',
  },
  buildDependencies: {
    'git-scm.org': '*',
    'npmjs.com': '*',
    'go.dev': '^1.25',
  },

  build: {
    script: [
      'rm -Rf ${ZUI_REPO_NAME}',
      'rm -Rf ./pkg/extensions/build',
      'git clone --depth=1 --branch ${ZUI_VERSION} https://github.com/${ZUI_REPO_OWNER}/${ZUI_REPO_NAME}',
      'cd "${ZUI_REPO_NAME}"',
      'npm install',
      'npm run build',
      '',
      'cp -r ${ZUI_REPO_NAME}/build ./pkg/extensions/',
      'go build -v -ldflags="${GO_LDFLAGS}" -tags="${ALL_EXTENSIONS}" -o "{{ prefix }}"/bin/zb ./cmd/zb',
      'go build -v -ldflags="${GO_LDFLAGS}" -tags="${ALL_EXTENSIONS}" -o "{{ prefix }}"/bin/zli ./cmd/zli',
      'go build -v -ldflags="${GO_LDFLAGS}" -tags="${ALL_EXTENSIONS}" -o "{{ prefix }}"/bin/zot ./cmd/zot',
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/zxp ./cmd/zxp',
    ],
    env: {
      'MODULE_PATH': '$(go list -m)',
      'CONFIG_PACKAGE': '${MODULE_PATH}/pkg/api/config',
      'CONFIG_RELEASE_TAG': '${CONFIG_PACKAGE}.ReleaseTag',
      'CONFIG_COMMIT': '${CONFIG_PACKAGE}.Commit',
      'CONFIG_BINARY_TYPE': '${CONFIG_PACKAGE}.BinaryType',
      'CONFIG_GO_VERSION': '${CONFIG_PACKAGE}.GoVersion',
      'RELEASE_TAG': '$(git describe --tags --abbrev=0)',
      'COMMIT': '$(git describe --always --tags --long)',
      'ALL_EXTENSIONS': 'debug,imagetrust,lint,metrics,mgmt,profile,scrub,search,sync,ui,userprefs,events',
      'BINARY_TYPE': '${ALL_EXTENSIONS}',
      'GO_VERSION': '$(go version | awk \'{print $3}\')',
      'CGO_ENABLED': '0',
      'GOEXPERIMENT': 'jsonv2',
      'GO_LDFLAGS': ['-s', '-w', '-X ${CONFIG_RELEASE_TAG}=${RELEASE_TAG}', '-X ${CONFIG_COMMIT}=${COMMIT}', '-X ${CONFIG_BINARY_TYPE}=${BINARY_TYPE}', '-X ${CONFIG_GO_VERSION}=${GO_VERSION}'],
      'ZUI_VERSION': '$(grep -m1 ZUI_VERSION Makefile | cut -d\' \' -f3)',
      'ZUI_REPO_OWNER': '$(grep -m1 ZUI_REPO_OWNER Makefile | cut -d\' \' -f3)',
      'ZUI_REPO_NAME': '$(grep -m1 ZUI_REPO_NAME Makefile | cut -d\' \' -f3)',
    },
  },
}
