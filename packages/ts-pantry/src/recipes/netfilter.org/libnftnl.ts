import type { Recipe } from '../../../scripts/recipe-types'
import { netfilterVersions } from '../../../scripts/netfilter-versions'

export const recipe: Recipe = {
  domain: 'netfilter.org/libnftnl', name: 'libnftnl', programs: [], platforms: ['linux'],
  description: 'Low-level userspace library for nftables Netlink messages.',
  homepage: 'https://www.netfilter.org/projects/libnftnl/',
  versionSource: { type: 'custom', fetch: () => netfilterVersions('libnftnl') },
  distributable: { url: 'https://www.netfilter.org/projects/libnftnl/files/libnftnl-{{version}}.tar.xz', stripComponents: 1 },
  dependencies: { 'netfilter.org/libmnl': '^1' },
  buildDependencies: { 'kernel.org/linux-headers': '*', 'freedesktop.org/pkg-config': '*' },
  build: { script: ['./configure --prefix={{prefix}} --libdir={{prefix}}/lib', 'make --jobs {{hw.concurrency}}', 'make install'] },
  test: { required: true, script: ['pkg-config --modversion libnftnl | grep -Fx "{{version}}"', 'test -f "{{prefix}}/lib/libnftnl.so"'] },
}
