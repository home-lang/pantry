import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'epsilon-project.sourceforge.io',
  name: 'epsilon',
  description: 'Powerful wavelet image compressor',
  homepage: 'https://sourceforge.net/projects/epsilon-project/',
  programs: ['epsilon'],
  dependencies: {
    'rpm.org/popt': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/epsilon-project/epsilon/{{version}}/epsilon-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-dependency-tracking',
      ],
      // epsilon's configure uses bare AC_CHECK_HEADER([popt.h]) /
      // AC_CHECK_LIB([popt]), which only search default system paths and
      // abort with "Configure script failed to find popt library!" when popt
      // lives in the pantry dep prefix. Point CPPFLAGS/LDFLAGS at the popt dep
      // so the checks resolve. (The "cc: unrecognized option '-version'" line
      // in the build log is a benign autoconf compiler-probe diagnostic, not
      // the fatal error.)
      CPPFLAGS: '-I{{deps.rpm.org/popt.prefix}}/include',
      LDFLAGS: '-L{{deps.rpm.org/popt.prefix}}/lib',
    },
    script: [
      // epsilon's configure.in uses the obsolete AM_PROG_LIBTOOL macro, so
      // aclocal (invoked by autoreconf) must be able to find libtool's M4
      // macros (libtool.m4 / ltsugar.m4). Collect every plausible aclocal dir
      // from the pantry libtool dep and from brew, and prepend them to
      // ACLOCAL_PATH so the macro resolves on both Linux and macOS.
      'for _lt_share in \\',
      '  "$(brew --prefix libtool 2>/dev/null)/share/aclocal" \\',
      '  {{deps.gnu.org/libtool.prefix}}/share/aclocal \\',
      '  {{deps.gnu.org/automake.prefix}}/share/aclocal \\',
      '  /usr/share/aclocal \\',
      '  /usr/local/share/aclocal; do',
      '  if [ -d "$_lt_share" ] && ls "$_lt_share"/libtool.m4 &>/dev/null; then',
      '    case ":${ACLOCAL_PATH:-}:" in *":$_lt_share:"*) ;; *) export ACLOCAL_PATH="${_lt_share}${ACLOCAL_PATH:+:$ACLOCAL_PATH}" ;; esac',
      '  fi',
      'done',
      '# Run libtoolize first so ltmain.sh and the M4 macros land in the tree.',
      'if command -v glibtoolize &>/dev/null; then',
      '  glibtoolize --force --copy --install 2>/dev/null || glibtoolize --force --copy || true',
      'elif command -v libtoolize &>/dev/null; then',
      '  libtoolize --force --copy --install 2>/dev/null || libtoolize --force --copy || true',
      'fi',
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
  },

  test: {
    script: [
      'epsilon --version | grep {{version}}',
    ],
  },
}
