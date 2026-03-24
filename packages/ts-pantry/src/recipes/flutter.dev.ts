import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'flutter.dev',
  name: 'flutter',
  description: 'Flutter makes it easy and fast to build beautiful apps for mobile and beyond',
  homepage: 'https://flutter.dev',
  github: 'https://github.com/flutter/flutter',
  programs: ['flutter', 'dart'],
  platforms: ['darwin', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'flutter/flutter/tags',
  },
  dependencies: {
    'git-scm.org': '*',
    'tukaani.org/xz': '*',
    'gnu.org/which': '*',
  },

  build: {
    script: [
      'curl -L "$DIST" | tar Jxf -',
      'curl -o flutter_darwin.zip "$DIST"',
      'unzip flutter_darwin.zip',
      'rm flutter_darwin.zip',
      '',
      'cd "{{prefix}}/bin"',
      'ln -s ../flutter/bin/flutter flutter',
      'ln -s ../flutter/bin/dart dart',
      '',
    ],
  },
}
