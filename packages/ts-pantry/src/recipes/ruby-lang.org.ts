import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/ruby-lang.org',
  domain: 'ruby-lang.org',
  name: 'ruby-lang',
  description: 'Powerful, clean, object-oriented scripting language',
  homepage: 'https://www.ruby-lang.org/',
  github: 'https://github.com/ruby/ruby',
  programs: ['erb', 'irb', 'rake', 'rdoc', 'ri', 'ruby'],
  versionSource: {
    type: 'github-releases',
    repo: 'ruby/ruby',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://cache.ruby-lang.org/pub/ruby/{{version.marketing}}/ruby-{{version}}.tar.xz',
    stripComponents: 1,
  },

  dependencies: {
    'openssl.org': '^1.1',
    'pyyaml.org': '^0.2',
    'zlib.net': '^1',
  },

  buildDependencies: {
    'gnu.org/gettext': '^0.21',
    'gnu.org/patch': '*',
    'gnu.org/bison': '^3',
    'gnu.org/autoconf': '*',
    'rust-lang.org': '^1', // required to build YJIT
    'rsync.samba.org': '*', // v4 fixes
    linux: {
      'ruby-lang.org': '^3', // ruby requires ruby to build
      'rubygems.org': '*',
      // ^^ only linux because we got issues on darwin currently and darwin provides ruby (for now)
    },
  },

  build: {
    script: [
      { run: 'ARGS="$ARGS --with-sitearchdir={{prefix}}/lib/ruby/site_ruby"', if: '<4' },
      // gets topdir prefix bc enable-load-relative. in v4
      { run: 'ARGS="$ARGS --with-sitearchdir=/lib/ruby/site_ruby"', if: '>=4' },

      'patch -p1 -F5 < props/mkconfig.rb.diff',

      'CC=cc CXX=c++ ./configure $ARGS',

      // clang17 doesn't like [[maybe_unused]] on types
      // fix cribbed from https://github.com/ruby/ruby/pull/4603/commits/fbdff085ef3c8a56e0a33404e8795879e3167549
      {
        run: [
          'if test -f maybe_unused.h; then',
          'sed -i -e \'s/elif RBIMPL_HAS_C_ATTRIBUTE(maybe_unused)/elif RBIMPL_HAS_C_ATTRIBUTE(maybe_unused) \\&\\& (__STDC_VERSION__ >= 202000L)/\' maybe_unused.h',
          'fi',
        ],
        if: 'linux',
        'working-directory': 'include/ruby/internal/attr',
      },

      // ^3.1.4 can't find rubygems without help on linux
      {
        run: [
          'if test {{hw.platform}} = "linux"; then',
          'sed -i "s_^RUBYLIB.*=.*\\$_RUBYLIB = ${RUBYLIB}_" uncommon.mk',
          'fi',
        ],
        if: '>=3.1.4<3.2',
      },
      // back in 4.0.0
      {
        run: [
          'if test {{hw.platform}} = "linux"; then',
          'sed -i "s_^RUBYLIB.*=.*\\$_RUBYLIB = ${RUBYLIB}_" common.mk',
          'fi',
        ],
        if: '>=4',
      },

      'make install',

      // we provide these as `rubygems.org`
      { run: 'rm -f bundle bundler gem', 'working-directory': '{{prefix}}/bin' },

      'fix-shebangs.ts {{prefix}}/bin/*',

      // ruby itself provides the gems for these and we don't want that
      // we want to pkg them ourselves as part of rubygems.org
      {
        'working-directory': '{{prefix}}/lib/ruby/{{version.marketing}}.0',
        run: [
          'for x in bundler rubygems bundler.rb rubygems.rb; do',
          '  if test -d $x; then',
          '    rm -rf $x',
          '  else',
          '    rm -f $x',
          '  fi',
          'done',
          'rm -rf ../gems/3.2.0/gems/bundler-*.*.*',
        ],
      },

      {
        run: [
          'rm -rf share/ri',
          'rm -rf share/doc',
          'rm -rf lib/ruby/site_ruby',
          'rm -rf lib/ruby/vendor_ruby',
        ],
        'working-directory': '{{prefix}}',
      },

      // weirdly files get put here and we can't figure out how to stop it
      {
        run: [
          'if test -d pkgconfig; then rm -rf pkgconfig; fi',
          'if test -d *-{{hw.platform}}* ; then',
          '  mv *-{{hw.platform}}*/* .',
          '  rmdir *-{{hw.platform}}*',
          'fi',
        ],
        'working-directory': '{{prefix}}/lib',
        if: '>=2.6',
      },

      {
        run: [
          'if test *-{{hw.platform}}*/bin/ruby ; then',
          '  unlink bin/ruby',
          '  mv *-{{hw.platform}}*/bin/ruby bin/ruby',
          '  rmdir *-{{hw.platform}}*/bin',
          '  rmdir *-{{hw.platform}}*',
          'fi',
        ],
        'working-directory': '{{prefix}}',
        if: '>=3.4',
      },

      // v4 is adding {{prefix}}/{{prefix}}, oddly.
      {
        run: [
          'if test -d include; then rsync include/ {{prefix}}/include/ -a; fi',
          // rbconfig.rb has a nil ref issue
          'sed -i -f $PROP lib/ruby/{{version.marketing}}.0/rbconfig.rb',
          'if test -d lib; then rsync lib/ {{prefix}}/lib/ -a; fi',
          'cd ..',
          // this './' is IMPORTANT
          'rm -rf ./{{prefix}}',
        ],
        prop: '/def RbConfig::expand/a\\\n    val = val || \'\'',
        if: '>=4',
        'working-directory': '{{prefix}}/{{prefix}}',
      },

      {
        run: 'sed -i -f $PROP rbconfig.rb',
        prop: [
          's|$$(DESTDIR){{prefix}}|$$(topdir)|g',
          's|CONFIG\\["prefix"\\] = .*|CONFIG\\["prefix"\\] = KEGDIR|g',
          's|CONFIG\\["topdir"\\] = .*|CONFIG\\["topdir"\\] = KEGDIR\\n  CONFIG["kegdir"] = KEGDIR\\n  CONFIG["sitearchdir"] = File.join(KEGDIR, "lib", "ruby", "site_ruby", File.basename(File.dirname(__FILE__)))|g',
          's|CONFIG\\["bindir"\\] = .*|CONFIG\\["bindir"\\] = File.join(KEGDIR, "bin")|g',
          's|CONFIG\\["sysconfdir"\\] = .*|CONFIG\\["sysconfdir"\\] = File.join(KEGDIR, "etc")|g',
          's|CONFIG\\["rubyhdrdir"\\] = .*|CONFIG\\["rubyhdrdir"\\] = File.join(KEGDIR, "include")|g',
          's|CONFIG\\["rubyarchhdrdir"\\] = .*|CONFIG\\["rubyarchhdrdir"\\] = File.join(KEGDIR, "include")|g',
          's|CONFIG\\["rubylibprefix"\\] = .*|CONFIG\\["rubylibprefix"\\] = File.join(KEGDIR, "lib", "ruby")|g',
          's|CONFIG\\["rubylibdir"\\] = .*|CONFIG\\["rubylibdir"\\] = File.join(KEGDIR, "lib", "ruby", File.basename(File.dirname(__FILE__)))|g',
          's|CONFIG\\["archdir"\\] = .*|CONFIG\\["archdir"\\] = File.join(KEGDIR, "lib", "ruby", File.basename(File.dirname(__FILE__)))|g',
          's|CONFIG\\["rubyarchdir"\\] = .*|CONFIG\\["rubyarchdir"\\] = File.join(KEGDIR, "lib", "ruby", File.basename(File.dirname(__FILE__)))|g',
          's|CONFIG\\["sitehdrdir"\\] = .*|CONFIG\\["sitehdrdir"\\] = File.join(KEGDIR, "include", "site_ruby")|g',
          's|CONFIG\\["vendorhdrdir"\\] = .*|CONFIG\\["vendorhdrdir"\\] = File.join(KEGDIR, "include", "vendor_ruby")|g',
          's|CONFIG\\["INSTALL"\\] =.*|CONFIG\\["INSTALL"\\] = "/usr/bin/install"|g',
        ].join('\n'),
        'working-directory': '{{prefix}}/lib/ruby/{{version.marketing}}.0',
      },

      {
        run: 'sed -i -e \'s|CONFIG\\["MJIT_CC"\\] =.*|CONFIG\\["MJIT_CC"\\] = "/usr/bin/cc"|g\' rbconfig.rb',
        if: '<4',
        'working-directory': '{{prefix}}/lib/ruby/{{version.marketing}}.0',
      },
    ],
    env: {
      CFLAGS: '$CFLAGS -Wno-implicit-function-declaration',
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-load-relative', // makes us relocatable
        '--without-gmp',
        '--with-rubyarchprefix={{prefix}}/lib/ruby', // no need for architecture specific crap
        '--with-rubyhdrdir={{prefix}}/include', // ^^
        '--with-rubyarchhdrdir={{prefix}}/include', // ^^
        '--disable-multiarch', // ^^
        '--with-vendordir=no', // is empty so don't pollute
        '--with-vendorarchdir=no', // ^^
        '--enable-yjit', // https://github.com/pkgxdev/pantry/issues/3538
        '--disable-install-doc',
      ],
    },
  },
}
