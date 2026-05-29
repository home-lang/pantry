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
    // pkgx pins the git checkout to the release tag (`ref: ${{version.tag}}`).
    // Without this the buildkit clones the default branch (a moving target) so
    // the build does not match the version being released. zot tags are
    // `vX.Y.Z`; the github-releases source has no tagPattern, so version.tag
    // resolves to the raw git tag via the GitHub API.
    url: 'git+https://github.com/project-zot/zot',
    ref: '{{version.tag}}',
  } as Recipe['distributable'] & { ref: string },
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
      // pkgx runs the ZUI frontend build via a `working-directory` so the shell
      // returns to the source root afterwards. Flattening this to a bare `cd`
      // would leave the cwd inside the ZUI repo and break the subsequent
      // `cp -r ${ZUI_REPO_NAME}/build` (a path relative to the source root).
      { run: ['npm install', 'npm run build'], 'working-directory': '${ZUI_REPO_NAME}' },
      'cp -r ${ZUI_REPO_NAME}/build ./pkg/extensions/',
      'go build -v -ldflags="${GO_LDFLAGS}" -tags="${ALL_EXTENSIONS}" -o "{{prefix}}"/bin/zb ./cmd/zb',
      'go build -v -ldflags="${GO_LDFLAGS}" -tags="${ALL_EXTENSIONS}" -o "{{prefix}}"/bin/zli ./cmd/zli',
      'go build -v -ldflags="${GO_LDFLAGS}" -tags="${ALL_EXTENSIONS}" -o "{{prefix}}"/bin/zot ./cmd/zot',
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{prefix}}"/bin/zxp ./cmd/zxp',
    ],
    env: {
      'MODULE_PATH': '$(go list -m)',
      'RELEASE_TAG': '$(git describe --tags --abbrev=0)',
      'COMMIT': '$(git describe --always --tags --long)',
      'ALL_EXTENSIONS': 'debug,imagetrust,lint,metrics,mgmt,profile,scrub,search,sync,ui,userprefs,events',
      'BINARY_TYPE': '${ALL_EXTENSIONS}',
      'GO_VERSION': '$(go version | awk \'{print $3}\')',
      'CGO_ENABLED': '0',
      'GOEXPERIMENT': 'jsonv2',
      'GO_LDFLAGS': [
        '-s',
        '-w',
        '-X ${MODULE_PATH}/pkg/api/config.ReleaseTag=${RELEASE_TAG}',
        '-X ${MODULE_PATH}/pkg/api/config.Commit=${COMMIT}',
        '-X ${MODULE_PATH}/pkg/api/config.BinaryType=${BINARY_TYPE}',
        '-X ${MODULE_PATH}/pkg/api/config.GoVersion=${GO_VERSION}',
        // since 2.1.17 — harmless on older versions (the linker ignores -X for
        // symbols that don't exist).
        '-X ${MODULE_PATH}/pkg/buildinfo.ReleaseTag=${RELEASE_TAG}',
        '-X ${MODULE_PATH}/pkg/buildinfo.Commit=${COMMIT}',
        '-X ${MODULE_PATH}/pkg/buildinfo.BinaryType=${BINARY_TYPE}',
        '-X ${MODULE_PATH}/pkg/buildinfo.GoVersion=${GO_VERSION}',
      ],
      'ZUI_VERSION': '$(grep -m1 ZUI_VERSION Makefile | cut -d\' \' -f3)',
      'ZUI_REPO_OWNER': '$(grep -m1 ZUI_REPO_OWNER Makefile | cut -d\' \' -f3)',
      'ZUI_REPO_NAME': '$(grep -m1 ZUI_REPO_NAME Makefile | cut -d\' \' -f3)',
      // NOTE: pkgx also adds `-buildmode=pie` to GO_LDFLAGS on linux via a
      // separate `linux:` group that it *appends* to the base flags. This
      // buildkit's platform-env merge OVERWRITES (not appends) a key, so a
      // `linux: { GO_LDFLAGS: [...] }` group here would clobber all the version
      // -info `-X` flags on linux. PIE is only hardening, not required to
      // build, so it is intentionally omitted to preserve the `-X` flags.
    },
  },
}
