import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cli.github.com',
  name: 'gh',
  description: 'GitHub’s official command line tool',
  homepage: 'https://cli.github.com/',
  github: 'https://github.com/cli/cli',
  programs: ['gh'],
  versionSource: {
    type: 'github-releases',
    repo: 'cli/cli',
  },
  distributable: {
    url: 'https://github.com/cli/cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'make bin/gh',
      'mkdir -p "{{prefix}}"/bin',
      'mv bin/gh "{{prefix}}"/bin',
      '',
      '# cleanup - gocache for some reason is not writeable',
      'chmod -R u+w "$GOPATH" "$GOCACHE"',
      'rm -rf "$GOPATH" "$GOCACHE"',
      '',
    ],
    env: {
      'GOPATH': '${{prefix}}/gopath',
      'GOCACHE': '${{prefix}}/gocache',
      'GH_VERSION': '${{version}}',
      'GO_LDFLAGS': ['-s -w'],
    },
  },
}
