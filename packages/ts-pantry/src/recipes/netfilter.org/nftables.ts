import type { Recipe } from '../../../scripts/recipe-types'
import { netfilterVersions } from '../../../scripts/netfilter-versions'

export const recipe: Recipe = {
  domain: 'netfilter.org/nftables', name: 'nftables', programs: ['nft'], platforms: ['linux'],
  description: 'Native nftables ruleset management with JSON and an interactive CLI.',
  homepage: 'https://www.netfilter.org/projects/nftables/',
  versionSource: { type: 'custom', fetch: () => netfilterVersions('nftables') },
  distributable: { url: 'https://www.netfilter.org/projects/nftables/files/nftables-{{version}}.tar.xz', stripComponents: 1 },
  dependencies: { 'netfilter.org/libmnl': '^1', 'netfilter.org/libnftnl': '^1', 'gnu.org/readline': '^8', 'digip.org/jansson': '^2', 'gnu.org/gmp': '^6' },
  buildDependencies: { 'kernel.org/linux-headers': '*', 'freedesktop.org/pkg-config': '*', 'gnu.org/bison': '*', 'github.com/westes/flex': '*' },
  build: {
    script: ['./configure --prefix={{prefix}} --libdir={{prefix}}/lib --with-cli=readline --with-json --disable-python --disable-man-doc', 'make --jobs {{hw.concurrency}}', 'make install'],
  },
  test: { required: true, script: ['nft --version | grep -F "{{version}}"', 'nft --help | grep -F -- --json'] },
}
