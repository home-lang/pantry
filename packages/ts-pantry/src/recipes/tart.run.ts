import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/tart.run',
  domain: 'tart.run',
  name: 'tart',
  description: 'macOS and Linux VMs on Apple Silicon to use in CI and other automations',
  homepage: 'https://tart.run',
  github: 'https://github.com/cirruslabs/tart',
  programs: ['tart'],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'cirruslabs/tart',
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      { run: 'curl -LSs https://github.com/cirruslabs/tart/releases/download/{{version.raw}}/tart.tar.gz | tar -xzf -', if: '>=2.24' },
      { run: 'curl -LSs https://github.com/cirruslabs/tart/releases/download/{{version.raw}}/tart-$ARCH.tar.gz | tar -xzf -', if: '>=2.5<2.24' },
      {
        run: [
          'if test {{hw.arch}} = "aarch64"; then',
          '  curl -LSs https://github.com/cirruslabs/tart/releases/download/{{version.raw}}/tart.tar.gz | tar -xzf -',
          'else',
          '  # not available on x86-64',
          '  false',
          'fi',
        ].join('\n'),
        if: '<2.5',
      },
      'cp -a tart.app {{prefix}}',
      'cp props/tart-shim {{prefix}}/bin/tart',
    ],
    env: {
      aarch64: {
        ARCH: 'arm64',
      },
      'x86-64': {
        ARCH: 'amd64',
      },
    },
  },
}
