import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nginx.org',
  name: 'nginx',
  description: 'HTTP(S) server and reverse proxy, and IMAP/POP3 proxy server',
  homepage: 'https://nginx.org/',
  github: 'https://github.com/nginx/nginx',
  programs: ['nginx'],
  versionSource: {
    type: 'github-releases',
    repo: 'nginx/nginx',
    tagPattern: /^release-(.+)$/,
  },
  distributable: {
    url: 'https://nginx.org/download/nginx-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pcre.org': '8.45',
    'zlib.net': '^1.2.13',
    'openssl.org': '^1.1.1k',
  },

  build: {
    script: [
      // nginx's auto/configure does NOT accept compiler-style bare `-I`/`-L`
      // tokens as configure options — include/lib dirs must be folded into a
      // SINGLE `--with-cc-opt` / `--with-ld-opt` flag. The previous recipe put
      // those flags inside the ARGS array, but buildkit joins ARGS with spaces
      // and `./configure $ARGS` is then word-split by bash, so the second/third
      // `-I.../include` tokens broke off from `--with-cc-opt=` and became bare
      // options, failing with `invalid option "-I/usr/include"`.
      //
      // To avoid the word-splitting we export the opt strings as their own
      // quoted env vars (buildkit emits `export VAR="..."`) and pass them to
      // configure as single quoted arguments. nginx finds OpenSSL/PCRE/zlib by
      // compiling probe programs, which respect these explicit include/lib
      // dirs as well as buildkit's CPATH/LIBRARY_PATH.
      './configure $ARGS \\\n        --with-cc-opt="$NGINX_CC_OPT" \\\n        --with-ld-opt="$NGINX_LD_OPT"',
      'make --jobs {{hw.concurrency}}',
      'make install',
      '',
      // nginx installs the binary to sbin/nginx, but the recipe declares
      // programs: ['nginx'] (i.e. bin/nginx). Expose it from bin/ so the
      // program resolves and matches the rest of the pantry (openresty does
      // the same move).
      'mkdir -p {{prefix}}/bin',
      'ln -sf ../sbin/nginx {{prefix}}/bin/nginx',
      '',
    ],
    env: {
      'ARGS': [
        '--prefix={{prefix}}',
        '--with-http_ssl_module',
        '--with-stream',
      ],
      // Folded into one flag each (see configure step above) so they survive
      // bash word-splitting and satisfy nginx's "single --with-cc-opt" rule.
      'NGINX_CC_OPT': '-I{{deps.openssl.org.prefix}}/include -I{{deps.pcre.org.prefix}}/include -I{{deps.zlib.net.prefix}}/include',
      'NGINX_LD_OPT': '-L{{deps.openssl.org.prefix}}/lib -L{{deps.pcre.org.prefix}}/lib -L{{deps.zlib.net.prefix}}/lib',
    },
  },
}
