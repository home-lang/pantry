import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/glauth/glauth",
  name: "glauth",
  programs: [
    "glauth",
    "glauth-setup",
  ],
  buildDependencies: {
    'git-scm.org': "*",
    'go.dev': "^1.23",
    'gnu.org/gcc': "*",
    'gnu.org/coreutils': "*",
    'stedolan.github.io/jq': "^1.7",
    linux: {
      'linux-pam.org': "1.5.3",
    },
  },
  distributable: {
    url: "git+https://github.com/glauth/glauth",
  },
  build: {
    script: [
      {
        run: "sed -i 's/^const Version.*/const Version = \"{{version.tag}}\"/' internal/version/const.go\ngo build -v -ldflags=\"${GO_LDFLAGS_BINARY}\" -trimpath -buildvcs=false -o \{{ prefix }}\/bin/glauth",
        'working-directory': "v2",
      },
      {
        run: "sed -i 's|git@github.com:|https://github.com/|g' .gitmodules\ngit submodule update --init --recursive",
      },
      {
        run: "export PLUGINS=$(ls -d glauth-*|grep -v \"pam$\")",
        'working-directory': "v2/pkg/plugins",
      },
      {
        run: "for plugin in ${PLUGINS}; do\ngo mod edit -json pkg/plugins/${plugin}/go.mod |\njq --raw-output '.Require|.[]|select(.Indirect!=true and ((.Path|contains(\"glauth\"))|not))| \"\\(.Path)@\\(.Version)\"' | xargs -I{} go get '{}'\nSRC_FILE=\"$(cd pkg/plugins/${plugin}/ && ls -1 *.go | grep ${plugin/glauth-/})\"\ngo build -v -ldflags=\"-s -w\" -buildmode=plugin -trimpath -o \{{ prefix }}\/lib/${plugin}.${LIB_SUFFIX} ./pkg/plugins/${plugin}/${SRC_FILE}\ndone",
        'working-directory': "v2",
      },
      {
        run: "install -Dm755 ${GLAUTH_SETUP_SCRIPT} {{prefix}}/bin/glauth-setup\ninstall -D ${GLAUTH_README_FILE} {{prefix}}/doc/${GLAUTH_README_FILE}\ninstall -D ${GLAUTH_CONFIG_FILE} {{prefix}}/etc/glauth/${GLAUTH_CONFIG_FILE}\ninstall -D ${GLAUTH_SERVICE_ENVIRONMENT_FILE} {{prefix}}/etc/glauth/${GLAUTH_SERVICE_ENVIRONMENT_FILE}\ninstall -D ${GLAUTH_SERVICE_SYSTEMD_FILE} {{prefix}}/etc/systemd/system/${GLAUTH_SERVICE_SYSTEMD_FILE}",
        'working-directory': "props",
      },
    ],
    env: {
      GLAUTH_SETUP_SCRIPT: "setup.bash",
      GLAUTH_README_FILE: "README.md",
      GLAUTH_CONFIG_FILE: "glauth.toml",
      GLAUTH_SERVICE_ENVIRONMENT_FILE: "glauth.env",
      GLAUTH_SERVICE_SYSTEMD_FILE: "glauth.service",
      CGO_ENABLED: 1,
      linux: {
        LIB_SUFFIX: "so",
        GO_LDFLAGS_BINARY: [
          "-buildmode=pie",
        ],
      },
      darwin: {
        LIB_SUFFIX: "dylib",
      },
      GO_LDFLAGS_PLUGIN: [
        "-w",
        "-s",
      ],
      GO_LDFLAGS_BINARY: [
        "-s",
        "-w",
      ],
    },
  },
}
