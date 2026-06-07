import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ArionThinker/tea-package-builder',
  name: 'tea-package-builder',
  programs: [
    'tea-package-builder',
  ],
  platforms: ['darwin'],
  dependencies: {
    linux: {
      'ffmpeg.org': '*',
      'gnome.org/gobject-introspection': '*',
      'gnome.org/glib': '^2',
    },
  },
  buildDependencies: {
    'nodejs.org': '>=14',
    'npmjs.com': '*',
    'git-scm.org': '^2',
  },
  distributable: {
    url: 'https://github.com/ArionThinker/tea-package-builder/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'npm install',
      'npm run package',
      'mkdir -p {{prefix}}/bin',
      {
        run: 'mkdir -p {{prefix}}/Applications\nmv out/tea-package-builder-{{hw.platform}}-*/tea-package-builder.app {{prefix}}/Applications\ncp props/tea-package-builder {{prefix}}/bin\n',
        if: 'darwin',
      },
      {
        run: 'mv out/tea-package-builder-{{hw.platform}}-*/tea-package-builder {{prefix}}/bin',
        if: 'linux',
      },
    ],
  },
  test: {
    script: [
      'tea-package-builder --version',
    ],
  },
  propsDir: 'props/github.com/ArionThinker/tea-package-builder',
}
