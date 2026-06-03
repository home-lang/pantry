import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/skylot/jadx',
  name: 'jadx',
  programs: [
    'jadx',
    'jadx-gui',
  ],
  dependencies: {
    'openjdk.org': '^21',
  },
  buildDependencies: {
    'gradle.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/skylot/jadx.git',
  },
  build: {
    script: [
      'gradle clean dist',
      'mkdir -p {{prefix}}',
      {
        run: 'cp -r bin lib {{prefix}}/',
        'working-directory': 'build/jadx',
      },
      {
        run: 'rm -rf ./*.bat',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
  test: {
    script: [
      'curl -L "https://raw.githubusercontent.com/facebook/redex/fa32d542d4074dbd485584413d69ea0c9c3cbc98/test/instr/redex-test.apk" -o redex-test.apk',
      'jadx -d out redex-test.apk | grep \'done\'',
      'ls | grep \'out\'',
    ],
  },
}
