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
      'make',
      'cd "openresty-{{version}}"',
      './configure --prefix={{prefix}}',
      'make -j {{hw.concurrency}}',
      'make install',
      'cd "${{prefix}}/bin"',
      'ln -sf ../nginx/sbin/nginx openresty',
      'sed -i -e \'2i use File::Basename qw(dirname);\' -e "s|\'{{prefix}}|dirname(\\$0) . \'/..|g" resty',
      'cd "${{prefix}}/bin"',
      'mv ../nginx/sbin/nginx .',
      'ln -s ../../bin/nginx ../nginx/sbin/',
      'cd "${{prefix}}"',
      'ln -s luajit/lib .',
    ],
  },
}
