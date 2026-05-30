import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gts.sourceforge.net',
  name: 'gts.sourceforge',
  description: 'GNU triangulated surface library',
  homepage: 'https://gts.sourceforge.net/',
  programs: ['delaunay', 'gts2dxf', 'gts2oogl', 'gts2stl', 'gtscheck', 'gtscompare', 'gtstemplate', 'stl2gts', 'transform'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/gts/gts/{{version.raw}}/gts-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/glib': '>=2.4.0',
  },
  buildDependencies: {
    'gnu.org/automake': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      // gts's configure.in uses the obsolete AM_PROG_LIBTOOL macro. For
      // autoreconf/aclocal to expand it, libtool's M4 macros (libtool.m4 /
      // ltsugar.m4) must be discoverable. Collect every plausible aclocal dir
      // from the pantry libtool dep and from brew, and prepend them to
      // ACLOCAL_PATH so the macro resolves on both Linux and macOS.
      'for _lt_share in \\',
      '  "$(brew --prefix libtool 2>/dev/null)/share/aclocal" \\',
      '  "{{deps.gnu.org/libtool.prefix}}/share/aclocal" \\',
      '  "{{deps.gnu.org/automake.prefix}}/share/aclocal" \\',
      '  /usr/share/aclocal \\',
      '  /usr/local/share/aclocal; do',
      '  if [ -d "$_lt_share" ] && ls "$_lt_share"/libtool.m4 &>/dev/null; then',
      '    case ":${ACLOCAL_PATH:-}:" in *":$_lt_share:"*) ;; *) export ACLOCAL_PATH="${_lt_share}${ACLOCAL_PATH:+:$ACLOCAL_PATH}" ;; esac',
      '  fi',
      'done',
      '# Run libtoolize first so ltmain.sh and the M4 macros land in the tree,',
      '# which makes the obsolete AM_PROG_LIBTOOL macro resolvable.',
      'if command -v glibtoolize &>/dev/null; then',
      '  glibtoolize --force --copy --install 2>/dev/null || glibtoolize --force --copy || true',
      'elif command -v libtoolize &>/dev/null; then',
      '  libtoolize --force --copy --install 2>/dev/null || libtoolize --force --copy || true',
      'fi',
      'autoreconf -fvi',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '# FIXME: gts-config prevents relocatability with absolute paths',
      'rm {{prefix}}/bin/gts-config',
      '',
    ],
    env: {
      'ARGS': '--prefix={{prefix}}',
    },
  },
}
