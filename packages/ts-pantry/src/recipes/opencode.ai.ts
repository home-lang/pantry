import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opencode.ai',
  name: 'opencode.ai',
  programs: ['opencode'],
  platforms: ['darwin', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'sst/opencode',
  },
  distributable: {
    url: 'https://github.com/sst/opencode/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'stedolan.github.io/jq': '*',
    'pkgx.sh': '*',
    'go.dev': '^1.24',
    'python.org': '3',
    'npmjs.com': '*',
  },

  build: {
    script: [
      'npm i -g husky',
      'npm i -g node-gyp',
      'mkdir -p packages/opencode/dist',
      'rm bun.lock',
      '$BUN install --production',
      '$BUN install semver',
      'cd "packages/tui"',
      'go mod download',
      'go build -ldflags "$GO_LDFLAGS" -o ../opencode/dist/tui ./cmd/opencode/main.go',
      'cd "packages/opencode"',
      '$BUN build --define "OPENCODE_VERSION=\'{{version}}\'" ./src/index.ts ./dist/tui --compile --minify --target=bun --outfile ./dist/opencode',
      'install -Dm755 ./dist/opencode {{prefix}}/bin/opencode',
      'cd "packages/opencode"',
      '$BUN run ./script/build.ts --single',
      'install -Dm755 dist/opencode-{{hw.platform}}-$ARCH/bin/opencode {{prefix}}/bin/opencode',
      'cd "${{prefix}}/bin"',
      'file opencode',
      'otool -l opencode',
      'codesign --remove-signature opencode || true',
    ],
    env: {
      'BUN': 'pkgx $(jq -r .packageManager package.json)',
      'PATH': '$HOME/.local/bin:$PATH',
      'GO_LDFLAGS': ['-s', '-w', '-X main.Version={{version}}'],
      'OPENCODE_CHANNEL': 'latest',
      'OPENCODE_VERSION': '${{version}}',
    },
    skip: ['fix-patchelf'],
  },
}
