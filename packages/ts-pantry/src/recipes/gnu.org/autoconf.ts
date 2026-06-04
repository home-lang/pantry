import type { Recipe } from '../../../scripts/recipe-types'

// Ported faithfully from pkgx: projects/gnu.org/autoconf/package.yml
// Source of truth: https://github.com/pkgxdev/pantry/blob/main/projects/gnu.org/autoconf/package.yml
export const recipe: Recipe = {
  propsDir: '../props/gnu.org/autoconf',
  domain: 'gnu.org/autoconf',
  name: 'autoconf',
  description: 'Automatic configure script builder',
  homepage: 'https://www.gnu.org/software/autoconf/',
  programs: ['autoconf', 'autoheader', 'autom4te', 'autoreconf', 'autoscan', 'autoupdate', 'ifnames'],
  distributable: {
    // Upstream tarballs use 2-part versions (autoconf-2.72.tar.gz), but the
    // pantry version list is zero-padded to 3 parts (2.72.0). version.marketing
    // ({{major}}.{{minor}}) yields the correct upstream filename for all
    // currently-tracked versions (2.71/2.72/2.73).
    url: 'https://ftp.gnu.org/gnu/autoconf/autoconf-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/m4': '1',
    'perl.org': '*',
  },
  buildDependencies: {
    // requires a C compiler to configure
    'llvm.org': '*',
  },
  build: {
    script: [
      './configure --build={{hw.target}} --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',

      // Post-install relocation: make the installed scripts relocatable by
      // replacing hardcoded {{prefix}} / dependency paths with $PREFIX / bare
      // interpreter names. Operates relative to {{prefix}}.
      {
        run: [
          'fix-shebangs.ts bin/*',

          // turn the hardcoded autoconf prefix into a $PREFIX reference
          'perl -pi -e \'s|\\x27{{prefix}}|"$PREFIX"\\x27|g\' bin/autoconf',

          // fix specific m4 and perl paths
          'perl -pi -e \'s|{{deps.perl.org.prefix}}/bin/perl|perl|g\' bin/*',
          'perl -pi -e \'s|{{deps.gnu.org/m4.prefix}}/bin/m4|m4|g\' bin/*',

          // fix hardcoded paths
          // this was a patch, but patches are fragile. this is more robust. for now.
          'PREFIX="$(echo \'{{prefix}}\' | sed \'s/\\+/\\\\+/g\')"',
          // NB: the replacement must emit a LITERAL `$prefix` (a runtime var in the
          // relocated script). Double-quoted shell + perl made `$prefix` interpolate
          // at BUILD time (undefined → empty), producing `|| .'/...'` which is a perl
          // syntax error (`near "|| ."`) that broke autoreconf for ALL autotools deps.
          // Single-quoted perl preserves the backslash so perl writes `$prefix` literally.
          'perl -pi -e \'s|\\x27\'"$PREFIX"\'/|\\$prefix.\\x27/|g\' bin/*',
        ],
        'working-directory': '{{prefix}}',
      },

      // <2.72.0 needs the relocatable.diff patch applied against the source tree
      {
        run: 'patch -p1 < $SRCROOT/props/relocatable.diff',
        if: '<2.72.0',
        'working-directory': '{{prefix}}',
      },

      // >=2.72.0 injects the prefix-derivation logic via perl instead of a patch
      {
        run: [
          'perl -p0i -e \'s/\\nBEGIN\\n\\{/use Cwd qw(abs_path);\\nuse File::Basename;\\n\\nmy \\$prefix;\\nBEGIN\\n{\\n  \\$prefix = dirname(dirname(abs_path(__FILE__)));\\n  \\$ENV{\\x27PREFIX\\x27} = \\$prefix;\\n/s\' bin/*',
          'perl -p0i -e \'s|\\n  \\# Normalize the|\\n  \\# added by pkgx\\n  \\@prepend_include = map { \\$_ =~ s/\\\\\\$PREFIX/\\$prefix/r } \\@prepend_include;\\n\\n  \\# Normalize the|g\' bin/autom4te',
        ],
        if: '>=2.72.0',
        'working-directory': '{{prefix}}',
      },

      {
        run: 'perl -pi -e "s|$PREFIX|\\$PREFIX|" share/autoconf/autom4te.cfg',
        'working-directory': '{{prefix}}',
      },
    ],
  },
}
