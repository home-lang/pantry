import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'sftpgo.com',
  name: 'sftpgo',
  description: 'Full-featured and highly configurable SFTP, HTTP/S, FTP/S and WebDAV server - S3, Google Cloud Storage, Azure Blob',
  homepage: 'https://sftpgo.com',
  github: 'https://github.com/drakkan/sftpgo',
  programs: ['sftpgo'],
  versionSource: {
    type: 'github-releases',
    repo: 'drakkan/sftpgo',
  },
  distributable: {
    url: 'https://github.com/drakkan/sftpgo/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '=1.22.2',
    'gnu.org/coreutils': '*',
  },

  build: {
    script: [
      'for f in props/*.gtpl; do [ -f "$f" ] && cp "$f" "${f%.gtpl}"; done',
      'TAGS="-tags nosqlite"',
      'go build -v $TAGS -trimpath -ldflags="${GO_LDFLAGS}" -o {{prefix}}/bin/sftpgo',
      'install -v -D props/${SFTPGO_SETUP_SCRIPT} {{prefix}}/bin/sftpgo-setup',
      'install -v -D props/${SFTPGO_README_FILE} {{prefix}}/doc/${SFTPGO_README_FILE}',
      'install -v -D ${SFTPGO_CONFIG_FILE} {{prefix}}/etc/sftpgo/${SFTPGO_CONFIG_FILE}',
      'install -v -D props/${SFTPGO_SERVICE_ENVIRONMENT_FILE} {{prefix}}/etc/sftpgo/${SFTPGO_SERVICE_ENVIRONMENT_FILE}',
      'install -v -D props/${SFTPGO_SERVICE_FILE} {{prefix}}/etc/systemd/system/${SFTPGO_SERVICE_FILE}',
      'find templates -type f -exec install -v -D "{}" "{{prefix}}/{}" \\;',
      'find static -type f -exec install -v -D "{}" "{{prefix}}/{}" \\;',
      'find openapi -type f -exec install -v -D "{}" "{{prefix}}/{}" \\;',
    ],
    env: {
      'CGO_ENABLED': '1',
      'COMMIT_SHA': '$(git describe --always --abbrev=8 --dirty)',
      'VERSION_DATE': '$(date -u +%FT%TZ)',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/drakkan/sftpgo/v2/internal/version.commit=${COMMIT_SHA}', '-X github.com/drakkan/sftpgo/v2/internal/version.date=${VERSION_DATE}'],
      'SFTPGO_SETUP_SCRIPT': 'setup.bash',
      'SFTPGO_README_FILE': 'README.md',
      'SFTPGO_CONFIG_FILE': 'sftpgo.json',
      'SFTPGO_SERVICE_ENVIRONMENT_FILE': 'sftpgo.env',
      'SFTPGO_SERVICE_FILE': 'sftpgo.service',
    },
  },
}
