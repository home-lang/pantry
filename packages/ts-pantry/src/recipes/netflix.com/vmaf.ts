import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'netflix.com/vmaf',
  name: 'vmaf',
  programs: [
    'vmaf',
  ],
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'nasm.us': '*',
  },
  distributable: {
    url: 'git+https://github.com/Netflix/vmaf.git',
  },
  build: {
    script: [
      'meson --prefix={{prefix}} --buildtype=release build',
      'meson compile -C build',
      'meson install -C build',
    ],
  },
  test: {
    script: [
      'cc $FIXTURE',
      './a.out',
    ],
  },
}
