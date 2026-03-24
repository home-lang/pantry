import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tart.run',
  name: 'tart',
  description: 'macOS and Linux VMs on Apple Silicon to use in CI and other automations',
  homepage: 'https://tart.run',
  github: 'https://github.com/cirruslabs/tart',
  programs: ['tart'],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'cirruslabs/tart/releases',
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'mkdir -p "{{prefix}}/bin"',
      'curl -LSs https://github.com/cirruslabs/tart/releases/download/{{version.tag}}/tart.tar.gz | tar -xzf -',
      'curl -LSs https://github.com/cirruslabs/tart/releases/download/{{version.tag}}/tart-$ARCH.tar.gz | tar -xzf -',
      'if test "{{hw.arch}}" = "aarch64"; then',
      '  curl -LSs https://github.com/cirruslabs/tart/releases/download/{{version.tag}}/tart.tar.gz | tar -xzf -',
      'else',
      '  # not available on x86-64',
      '  false',
      'fi',
      '',
      'cp -a tart.app "{{prefix}}"',
      'cp props/tart-shim "{{prefix}}"/bin/tart',
    ],
  },
}
