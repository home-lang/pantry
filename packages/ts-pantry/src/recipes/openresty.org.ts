import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openresty.org',
  name: 'openresty',
  description: 'High Performance Web Platform Based on Nginx and LuaJIT',
  homepage: 'https://openresty.org',
  github: 'https://github.com/openresty/openresty',
  programs: ['nginx-xml2pod', 'opm', 'resty', 'restydoc', 'restydoc-index'],
  versionSource: {
    type: 'github-releases',
    repo: 'openresty/openresty',
  },
  distributable: {
    url: 'https://github.com/openresty/openresty/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pcre.org': '8',
    'openssl.org': '^1.1',
    'zlib.net': '^1.2',
    'perl.org': '*',
  },
  buildDependencies: {
    'waterlan.home.xs4all.nl/dos2unix': '*',
    'mercurial-scm.org': '*',
    'git-scm.org': '*',
    'gnu.org/wget': '*',
  },

  build: {
    script: [
      // Step 1: Rebuild the tar-ball
      // https://github.com/openresty/openresty?tab=readme-ov-file#for-bundle-maintainers
      { run: 'make' },
      // Step 2: Building OpenResty
      // https://openresty.org/en/installation.html#building-from-source
      {
        run: [
          './configure --prefix={{prefix}}',
          'make -j {{hw.concurrency}}',
          'make install',
        ],
        'working-directory': 'openresty-{{version}}',
      },
      {
        run: [
          'ln -sf ../nginx/sbin/nginx openresty',
          // need to clean up paths in the scripts
          'sed -i -e \'2i use File::Basename qw(dirname);\' -e "s|\'{{prefix}}|dirname(\\$0) . \'/..|g" resty',
        ],
        'working-directory': '${{prefix}}/bin',
      },
      // ensure this is patched
      {
        run: [
          'mv ../nginx/sbin/nginx .',
          'ln -s ../../bin/nginx ../nginx/sbin/',
        ],
        'working-directory': '${{prefix}}/bin',
      },
      // move this so pantry can manage it
      {
        run: 'ln -s luajit/lib .',
        'working-directory': '${{prefix}}',
      },
    ],
  },
  test: {
    script: [
      'resty -V',
      'resty -V 2>&1 | grep \'openresty/{{version}}\'',
    ],
  },
}
