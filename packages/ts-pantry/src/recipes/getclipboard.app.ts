import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'getclipboard.app',
  name: 'cb',
  description: '😎🏖️🐬 Your new, 𝙧𝙞𝙙𝙤𝙣𝙠𝙪𝙡𝙞𝙘𝙞𝙤𝙪𝙨𝙡𝙮 smart clipboard manager',
  homepage: 'https://getclipboard.app',
  github: 'https://github.com/Slackadays/Clipboard',
  programs: ['cb'],
  versionSource: {
    type: 'github-releases',
    repo: 'Slackadays/Clipboard',
  },
  distributable: {
    url: 'https://github.com/Slackadays/Clipboard/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake -S . -B build -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release -Wno-dev',
      'cmake --build build',
      'cmake --install build',
    ],
  },
}
