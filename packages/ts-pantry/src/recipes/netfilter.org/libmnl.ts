import type { Recipe } from '../../../scripts/recipe-types'
import { netfilterVersions } from '../../../scripts/netfilter-versions'

export const recipe: Recipe = {
  domain: 'netfilter.org/libmnl', name: 'libmnl', programs: [], platforms: ['linux'],
  description: 'Minimal userspace library for Netlink communications.',
  homepage: 'https://www.netfilter.org/projects/libmnl/',
  versionSource: { type: 'custom', fetch: () => netfilterVersions('libmnl') },
  distributable: { url: 'https://www.netfilter.org/projects/libmnl/files/libmnl-{{version}}.tar.bz2', stripComponents: 1 },
  buildDependencies: { 'kernel.org/linux-headers': '*', 'freedesktop.org/pkg-config': '*' },
  build: { script: ['./configure --prefix={{prefix}} --libdir={{prefix}}/lib', 'make --jobs {{hw.concurrency}}', 'make install'] },
  test: { required: true, script: ['pkg-config --modversion libmnl | grep -Fx "{{version}}"', 'test -f "{{prefix}}/lib/libmnl.so"'] },
}
