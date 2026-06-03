import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/rubygems.org',
  domain: 'rubygems.org',
  name: 'rubygems',
  description: 'Powerful, clean, object-oriented scripting language',
  homepage: 'https://www.ruby-lang.org/',
  github: 'https://github.com/ruby/ruby',
  programs: ['bundle', 'bundler', 'gem'],
  versionSource: {
    type: 'github-releases',
    repo: 'rubygems/rubygems',
  },
  distributable: {
    url: 'https://github.com/rubygems/rubygems/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'ruby-lang.org': '>=2.3',
  },
  buildDependencies: {
    // rubygems 4.0.x's setup.rb hard-aborts on Ruby < 3.2 ("RubyGems only
    // supports Ruby 3.2 or higher"), and now that pantry ships Ruby 4.0.x the
    // bare `<4` could otherwise resolve to an EOL 3.x. Floor it at 3.2 so the
    // build toolchain is always capable of compiling the current rubygems.
    'ruby-lang.org': '>=3.2<4',
  },

  build: {
    script: [
      'ruby setup.rb --prefix={{prefix}} --env-shebang --no-ri --no-rdoc',

      // 3.5.5 fixed this — older rubygems split the spec cache dir across
      // ~/.gem and data_home; force it to a single cache_home location.
      {
        run: 'patch -p1 --no-backup-if-mismatch < $PROP',
        if: '<3.5.5',
        'working-directory': '{{prefix}}',
        prop: [
          '--- a/lib/rubygems/defaults.rb',
          '+++ b/lib/rubygems/defaults.rb',
          '@@ -20,13 +20,7 @@ def self.default_sources',
          '   # specified in the environment',
          '',
          '   def self.default_spec_cache_dir',
          '-    default_spec_cache_dir = File.join Gem.user_home, ".gem", "specs"',
          '-',
          '-    unless File.exist?(default_spec_cache_dir)',
          '-      default_spec_cache_dir = File.join Gem.data_home, "gem", "specs"',
          '-    end',
          '-',
          '-    default_spec_cache_dir',
          '+    File.join Gem.cache_home, "gem", "specs"',
          '   end',
          '',
          '   ##',
          '',
        ].join('\n'),
      },

      {
        run: 'patch -p1 --no-backup-if-mismatch < "$SRCROOT"/props/fit-n-finish.patch',
        'working-directory': '{{prefix}}',
      },

      // 3.5.7 removed some redundant parens, breaking patching
      {
        run: 'patch -p1 --no-backup-if-mismatch < "$SRCROOT"/props/fit-n-finish2-pre357.patch',
        if: '<3.5.7',
        'working-directory': '{{prefix}}',
      },
      {
        run: 'patch -p1 --no-backup-if-mismatch < "$SRCROOT"/props/fit-n-finish2-post357.patch',
        if: '>=3.5.7',
        'working-directory': '{{prefix}}',
      },

      // makes ruby's default system dir be fixed in /usr/local/lib/ruby
      // rather than relative to the dep prefix
      {
        run: [
          'patch -p1 --no-backup-if-mismatch < "$SRCROOT"/props/default-sys-dir.patch',
          'sed -i -e \'s/Gem.default_dir/Gem.default_system_dir/\' lib/rubygems/path_support.rb',
        ],
        'working-directory': '{{prefix}}',
      },

      // removes redundant `gem` directory that looks gross in our directory formatting
      {
        run: 'sed -i -e \'s/Gem.state_home, "gem",/Gem.state_home,/\' defaults.rb',
        'working-directory': '{{prefix}}/lib/rubygems',
        if: '>=3.4',
      },

      // ensure `gem` tries to install to ~/.gem if /usr/local is not writable
      {
        run: 'patch -p1 --no-backup-if-mismatch < "$SRCROOT"/props/user-install-pre3.5.patch',
        'working-directory': '{{prefix}}',
        if: '<3.5',
      },
      {
        run: 'patch -p1 --no-backup-if-mismatch < "$SRCROOT"/props/user-install-post3.5.patch',
        'working-directory': '{{prefix}}',
        if: '>=3.5',
      },

      // fixes bug where gem won't create the full directory path when installing
      {
        run: 'sed -i -e \'s/Dir\\.mkdir dir, \\*\\[options\\[:dir_mode\\].*/FileUtils.mkdir_p dir, *[options[:dir_mode] \\&\\& 0o755].compact/\' installer.rb',
        'working-directory': '{{prefix}}/lib/rubygems',
      },

      // these are provided by ruby-lang.org; gem drops them here but ruby is
      // already in PATH and preferred
      {
        run: 'for PROG in rake rbs rdbg typeprof; do if test -f $PROG; then rm $PROG; fi; done',
        'working-directory': '{{prefix}}/bin',
      },

      // ruby ignores everything before a ruby shebang, so we wrap bundle/bundler/gem
      // as POSIX shell scripts that set up GEM_PATH then re-exec themselves as ruby.
      // REF https://github.com/pkgxdev/pantry/issues/4010
      {
        run: [
          'for tool in bundle bundler; do',
          '  echo "$(cat $PROP gems/bundler-*/exe/$tool)" > bin/$tool',
          'done',
          'echo "$(cat $PROP bin/gem)" > bin/gem',
        ],
        'working-directory': '{{prefix}}',
        prop: [
          '#!/bin/sh',
          'd="$(cd "$(dirname "$0")"/.. && pwd)"',
          'export RUBYLIB="$d/lib"',
          'user_gem_dir="$(ruby -e \'require "rubygems"; print Gem.user_dir\')"',
          'ruby_gem_dir="$(ruby -e \'require "rbconfig"; print File.join(RbConfig::CONFIG["rubylibprefix"], "gems", RbConfig::CONFIG["ruby_version"])\')"',
          'if [ -z "$GEM_PATH" ]; then',
          '  export GEM_PATH="$d:$user_gem_dir:$ruby_gem_dir"',
          'else',
          '  export GEM_PATH="$d:$user_gem_dir:$ruby_gem_dir:$GEM_PATH"',
          'fi',
          'exec ruby "$0" "$@"',
          '',
        ].join('\n'),
      },

      // missing include?
      {
        run: 'sed -i -f $PROP installer.rb',
        'working-directory': '{{prefix}}/lib/rubygems',
        if: '>=4.0.2',
        prop: '1i\\\nrequire \'etc\'\\\n',
      },

      // no longer needed
      'rm -rf {{prefix}}/gems',

      // bundler figures out the "gem path" by checking for this directory structure
      { run: 'ln -s bin exe', 'working-directory': '{{prefix}}' },

      // clean up empty, unused directory
      'rmdir {{prefix}}/plugins',
    ],
  },
}
