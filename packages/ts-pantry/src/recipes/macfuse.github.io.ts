import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'macfuse.github.io',
  name: 'macfuse.github',
  description: 'macFUSE umbrella repository',
  github: 'https://github.com/macfuse/macfuse',
  programs: [],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'macfuse/macfuse',
    tagPattern: /^macfuse-(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/macfuse/macfuse.git',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'git submodule update --init --recursive',
      'cd "Library-3/build"',
      'meson setup .. $ARGS',
      'meson compile',
      'meson install',
      'cd "${{prefix}}/lib/pkgconfig"',
      'sed \'s/Name: fuse3/Name: fuse/\' fuse3.pc > fuse.pc',
      '',
    ],
    env: {
      'ARGS': ['-Dudevrulesdir={{prefix}}/etc/udev/rules.d', '-Dinitscriptdir={{prefix}}/etc/init.d', '-Dsysconfdir={{prefix}}/etc', '-Duseroot=false', '--prefix={{prefix}}'],
    },
  },
}
