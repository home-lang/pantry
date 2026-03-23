import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
      'pip3 install --break-system-packages uv 2>/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh 2>/dev/null || true',
      'export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"',
      'cd "sdk"',
      'go mod download',
      'cd "pkg"',
      'go mod download',
      'mkdir -p {{prefix}}/bin',
      'cd "sdk"',
      'sed -i.bak \'s/-ldflags "/-ldflags "-buildmode=pie /\' */Makefile',
      'cd "sdk"',
      'for DIR in go nodejs; do',
      '  make -C $DIR install_plugin PULUMI_BIN={{prefix}}/bin',
      'done',
      '',
      'cd "pkg"',
      'go build -ldflags "$GO_LDFLAGS" -o {{prefix}}/bin/pulumi ./cmd/pulumi',
      './scripts/prep-for-goreleaser.sh "local"',
      'cp -a bin/$(go env GOOS)*/* {{prefix}}/bin/',
    ],
    env: {
      'GOPATH': '$PWD/build',
      'GO_LDFLAGS': ['-X github.com/pulumi/pulumi/pkg/v3/version.Version={{version}}'],
    },
  },
}
