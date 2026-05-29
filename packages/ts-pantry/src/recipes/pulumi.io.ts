import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pulumi.io',
  name: 'pulumi',
  description: 'Pulumi - Infrastructure as Code in any programming language 🚀',
  homepage: 'https://pulumi.io/',
  github: 'https://github.com/pulumi/pulumi',
  programs: ['pulumi', 'pulumi-analyzer-policy', 'pulumi-analyzer-policy-python', 'pulumi-language-dotnet', 'pulumi-language-go', 'pulumi-language-java', 'pulumi-language-nodejs', 'pulumi-language-python', 'pulumi-language-python-exec', 'pulumi-language-yaml', 'pulumi-resource-pulumi-nodejs', 'pulumi-resource-pulumi-python', 'pulumi-watch'],
  versionSource: {
    type: 'github-releases',
    repo: 'pulumi/pulumi',
  },
  distributable: {
    url: 'git+https://github.com/pulumi/pulumi.git',
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.20',
    'classic.yarnpkg.com': '*',
    'nodejs.org': '*',
  },

  build: {
    script: [
      { run: 'go mod download', 'working-directory': 'sdk' },
      { run: 'go mod download', 'working-directory': 'pkg' },
      'mkdir -p {{prefix}}/bin',
      // needs this fix to prevent segfaults
      { run: 'sed -i.bak \'s/-ldflags "/-ldflags "-buildmode=pie /\' */Makefile', 'working-directory': 'sdk' },
      {
        run: [
          'for DIR in go nodejs python; do',
          '  make -C $DIR install_plugin PULUMI_BIN={{prefix}}/bin',
          'done',
        ],
        'working-directory': 'sdk',
      },
      // The next steps are modified from scripts/brew.sh
      {
        run: 'go build -ldflags "$GO_LDFLAGS" -o {{prefix}}/bin/pulumi ./cmd/pulumi',
        'working-directory': 'pkg',
      },
      { run: './scripts/prep-for-goreleaser.sh "local"', 'working-directory': 'pkg' },
      { run: 'cp -a bin/$(go env GOOS)*/* {{prefix}}/bin/', 'working-directory': 'pkg' },
    ],
    env: {
      'GOPATH': '$PWD/build',
      'GO_LDFLAGS': ['-X github.com/pulumi/pulumi/pkg/v3/version.Version={{version}}'],
      'linux': {
        GO_LDFLAGS: ['-buildmode=pie'],
      },
    },
  },
}
