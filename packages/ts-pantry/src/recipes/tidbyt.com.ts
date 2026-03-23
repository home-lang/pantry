import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tidbyt.com',
  name: 'pixlet',
  description: 'Build apps for pixel-based displays ✨',
  homepage: 'https://tidbyt.com',
  github: 'https://github.com/tidbyt/pixlet',
  programs: ['pixlet'],
  versionSource: {
    type: 'github-releases',
    repo: 'tidbyt/pixlet',
  },
  distributable: {
    url: 'https://github.com/tidbyt/pixlet/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'google.com/webp': '^1',
  },
  buildDependencies: {
    'go.dev': '^1.22',
    'npmjs.com': '*',
    'nodejs.org': '*',
  },

  build: {
    script: [
      'npm i',
      'npm run build',
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
      'GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w" -o ${BUILDLOC}.wasm tidbyt.dev/pixlet',
    ],
    env: {
      'BUILDLOC': '{{prefix}}/bin/pixlet',
      'LDFLAGS': ['-s', '-w', '-X=tidbyt.dev/pixlet/cmd.Version={{version}}'],
    },
  },
}
