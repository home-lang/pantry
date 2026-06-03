import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openbao.org/openbao',
  name: 'openbao',
  programs: [
    'bao',
    'bao-setup',
  ],
  buildDependencies: {
    'go.dev': '*',
    'gnu.org/coreutils': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/openbao/openbao',
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/${OPENBAO_BINARY}',
      'install -D props/${OPENBAO_SETUP_SCRIPT} {{prefix}}/bin/bao-setup',
      'install -D props/${OPENBAO_README_FILE} {{prefix}}/doc/${OPENBAO_README_FILE}',
      'install -D props/${OPENBAO_CONFIG_FILE} {{prefix}}/etc/openbao/${OPENBAO_CONFIG_FILE}',
      'install -D props/${OPENBAO_SERVICE_ENVIRONMENT_FILE} {{prefix}}/etc/openbao/${OPENBAO_SERVICE_ENVIRONMENT_FILE}',
      'install -D props/${OPENBAO_SERVICE_FILE} {{prefix}}/etc/systemd/system/${OPENBAO_SERVICE_FILE}',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/openbao/openbao/version.fullVersion={{version}}',
        '-X github.com/openbao/openbao/version.GitCommit=$( git rev-parse HEAD )',
        '-X github.com/openbao/openbao/version.BuildDate=$( date --iso-8601=seconds )',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
      OPENBAO_BINARY: 'bao',
      OPENBAO_SETUP_SCRIPT: 'setup.bash',
      OPENBAO_README_FILE: 'README.md',
      OPENBAO_CONFIG_FILE: 'openbao.hcl',
      OPENBAO_SERVICE_ENVIRONMENT_FILE: 'openbao.env',
      OPENBAO_SERVICE_FILE: 'openbao.service',
    },
  },
}
