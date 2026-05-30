import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'c-ares.org',
  name: 'c-ares',
  description: 'A C library for asynchronous DNS requests',
  programs: ['c-ares'],
  distributable: {
    // c-ares.org/download/ now 404s for every version; the project publishes
    // release tarballs on GitHub (tag v{{version}}). Upstream pkgx lists this
    // as the fallback distributable — we use it as the primary since the
    // c-ares.org mirror is dead.
    url: 'https://github.com/c-ares/c-ares/releases/download/v{{version}}/c-ares-{{version}}.tar.gz',
    stripComponents: 1,
  },

  buildDependencies: {
    'cmake.org': '^3',
    'curl.se': '*',
  },

  build: {
    workingDirectory: 'build',
    script: [
      // thirdparty header not packaged in the tarball for these versions
      // https://github.com/c-ares/c-ares/pull/750
      // the URL 404s now, but it's only needed for these old versions.
      {
        run: 'curl -O https://opensource.apple.com/source/configd/configd-1109.140.1/dnsinfo/dnsinfo.h',
        'working-directory': '../src/lib/thirdparty/apple',
        if: '>=1.29.0<1.34.3',
      },
      'cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
