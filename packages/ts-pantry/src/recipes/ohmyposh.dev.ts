import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ohmyposh.dev',
  name: 'oh-my-posh',
  description: 'The most customisable and low-latency cross platform/shell prompt renderer',
  homepage: 'https://ohmyposh.dev',
  github: 'https://github.com/JanDeDobbeleer/oh-my-posh',
  programs: ['oh-my-posh'],
  versionSource: {
    type: 'github-releases',
    repo: 'JanDeDobbeleer/oh-my-posh',
  },
  distributable: {
    url: 'git+https://github.com/JanDeDobbeleer/oh-my-posh.git',
  },
  buildDependencies: {
    'go.dev': '>=1.21',
  },

  build: {
    script: [
      { run: 'go build $ARGS -ldflags="$LDFLAGS"', 'working-directory': 'src' },
      'cp -r themes {{prefix}}/',
      'mkdir -p {{prefix}}/share/oh-my-posh',
      { run: 'ln -s ../../themes themes', 'working-directory': '{{prefix}}/share/oh-my-posh' },
    ],
    env: {
      'VERSION_DATE': '$(date -u +%FT%TZ)',
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/oh-my-posh'],
      'LDFLAGS': ['-s', '-w', '-X github.com/jandedobbeleer/oh-my-posh/src/build.Version={{version}}', '-X github.com/jandedobbeleer/oh-my-posh/src/build.Date=${VERSION_DATE}'],
      'linux': {
        LDFLAGS: ['-s', '-w', '-X github.com/jandedobbeleer/oh-my-posh/src/build.Version={{version}}', '-X github.com/jandedobbeleer/oh-my-posh/src/build.Date=${VERSION_DATE}', '-buildmode=pie'],
      },
    },
  },
}
