import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/OutOfBedlam/tine',
  name: 'tine',
  programs: [
    'tine',
  ],
  buildDependencies: {
    'go.dev': '^1.22',
  },
  distributable: {
    url: 'https://github.com/OutOfBedlam/tine/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go run magefiles/mage.go buildx v{{version}} _pkgx_',
      'mkdir -p {{prefix}}/bin',
      'cp ./tmp/tine {{prefix}}/bin/tine',
    ],
  },
  test: {
    script: [
      'test $(tine version | cut -d" " -f 1) = {{version}}',
      'cp $FIXTURE config.toml',
      'cp $FIXTURE config.toml',
      'tine run --pid tine.pid config.toml > out &',
      'sleep 6',
      'grep cpu, out',
      'kill $(cat tine.pid)',
    ],
  },
}
