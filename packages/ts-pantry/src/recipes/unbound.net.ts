import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'unbound.net',
  name: 'unbound',
  description: 'Unbound is a validating, recursive, and caching DNS resolver.',
  homepage: 'https://nlnetlabs.nl/unbound',
  github: 'https://github.com/NLnetLabs/unbound',
  programs: ['unbound', 'unbound-anchor', 'unbound-checkconf', 'unbound-control', 'unbound-control-setup', 'unbound-host'],
  versionSource: {
    type: 'github-releases',
    repo: 'NLnetLabs/unbound',
    tagPattern: /^release-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/NLnetLabs/unbound/archive/refs/tags/release-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1',
  },
  buildDependencies: {
    'libexpat.github.io': '*',
    'github.com/westes/flex': '*',
    'gnu.org/bison': '^3',
  },

  build: {
    script: [
      './configure $ARGS',
      // pthread_set_name_np is the FreeBSD/NetBSD spelling and does not exist on
      // macOS (only the 1-arg pthread_setname_np) or Linux/glibc (only the 2-arg
      // form). unbound's configure probes for it with a -Werror compile test, but
      // our cc_wrapper injects -Wno-error=implicit-function-declaration, which
      // defeats that -Werror and yields a false positive. HAVE_PTHREAD_SET_NAME_NP
      // then wins in util/locks.h over the correct HAVE_PTHREAD_SETNAME_NP1 (macOS)
      // / HAVE_PTHREAD_SETNAME_NP (Linux), producing a link error for the
      // nonexistent _pthread_set_name_np symbol. Undefine it so the build falls
      // through to the real, platform-correct API already detected by configure.
      { run: 'sed -i.bak -e "s|^#define HAVE_PTHREAD_SET_NAME_NP 1|/* #undef HAVE_PTHREAD_SET_NAME_NP */|" config.h && rm -f config.h.bak' },
      'make -j {{hw.concurrency}} install',
      '',
      'cd {{prefix}}/bin',
      'sed -i.bak -e "s|$PKGX_DIR/|\\$PKGX_DIR/|g" unbound-control-setup',
      'rm unbound-control-setup.bak',
      '',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--sbindir={{prefix}}/bin', '--with-ssl={{deps.openssl.org.prefix}}', '--with-libexpat={{deps.libexpat.github.io.prefix}}'],
    },
  },
}
