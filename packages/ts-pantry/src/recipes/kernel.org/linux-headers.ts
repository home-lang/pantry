import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kernel.org/linux-headers',
  name: 'linux-headers',
  programs: [],
  platforms: ['linux'],
  distributable: {
    url: 'https://cdn.kernel.org/pub/linux/kernel/v{{version.major}}.x/linux-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make headers',
      'mkdir -p {{prefix}}',
      'cp -a usr/include {{prefix}}/',
    ],
  },
  test: {
    script: [
      'PATCH=$(test {{version.patch}} -gt 255 && echo 255 || echo {{version.patch}})',
      'V=$(({{version.major}} * 65536 + {{version.minor}} * 256 + $PATCH))',
      'grep "LINUX_VERSION_CODE $V" {{prefix}}/include/linux/version.h',
    ],
  },
}
