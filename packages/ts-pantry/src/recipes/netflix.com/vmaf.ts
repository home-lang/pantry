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
    ref: 'v{{version.raw}}',
  },
  build: {
    // The meson project root is the libvmaf/ subdirectory, not the repo root.
    script: [
      'meson setup --prefix={{prefix}} --buildtype=release -Denable_tests=false build libvmaf',
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
