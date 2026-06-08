import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nasm.us',
  name: 'nasm.us',
  description: 'A cross-platform x86 assembler with an Intel-like syntax',
  homepage: 'https://www.nasm.us/',
  github: 'https://github.com/netwide-assembler/nasm',
  programs: ['nasm', 'ndisasm'],
  // The nasm GitHub repo carries development tags (e.g. 3.x) that have NO
  // published source tarball on nasm.us — github-releases yields a bogus
  // version like 3.1.0 whose distributable 404s. Mirror pkgx's versions.url:
  // scrape the official nasm.us release directory listing instead.
  versionSource: {
    type: 'custom',
    fetch: async () => {
      const res = await fetch('https://www.nasm.us/pub/nasm/releasebuilds/')
      const html = await res.text()
      const versions = new Set<string>()
      // match directory hrefs like 2.16.03/ , 2.16/ , 2.05.01/
      for (const m of html.matchAll(/href="(\d+\.\d+(?:\.\d+)?)\/"/g))
        versions.add(m[1])
      // newest first (semver-ish numeric sort)
      return [...versions].sort((a, b) => {
        const pa = a.split('.').map(Number)
        const pb = b.split('.').map(Number)
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          const d = (pb[i] || 0) - (pa[i] || 0)
          if (d !== 0)
            return d
        }
        return 0
      })
    },
  },
  distributable: {
    url: 'https://www.nasm.us/pub/nasm/releasebuilds/{{version.raw}}/nasm-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      // https://github.com/netwide-assembler/nasm/commit/dc247c9f9913e336200ecf8bb72152fdabdb3585#r167178007
      { run: 'sed -i \'s/l32toh(/le32toh(/g\' bytesex.h', 'working-directory': 'include' },
      './configure --prefix={{prefix}}',
      // rdoff tools removed as unfixable in 2.16
      // https://github.com/netwide-assembler/nasm/commit/93548c2de2a3c218b3d0ab4061b26d9781cb6b37
      {
        run: [
          'make --jobs {{hw.concurrency}} rdf',
          'make install install_rdf',
        ],
        if: '<2.16',
      },
      {
        run: [
          'make --jobs {{hw.concurrency}}',
          'make install',
        ],
        if: '>=2.16',
      },
    ],
  },
}
