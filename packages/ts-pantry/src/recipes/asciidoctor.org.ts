import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/asciidoctor.org',
  domain: 'asciidoctor.org',
  name: 'asciidoctor',
  description: ':gem: A fast, open source text processor and publishing toolchain, written in Ruby, for converting AsciiDoc content to HTML 5, DocBook 5, and other formats.',
  homepage: 'https://asciidoctor.org/',
  github: 'https://github.com/asciidoctor/asciidoctor',
  programs: ['asciidoctor'],
  versionSource: {
    type: 'github-releases',
    repo: 'asciidoctor/asciidoctor',
  },
  distributable: {
    url: 'https://github.com/asciidoctor/asciidoctor/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'ruby-lang.org': '^3.1',
    'rubygems.org': '*',
  },
  buildDependencies: {
    'rubygems.org': '*',
  },

  build: {
    env: {
      GEM_HOME: '{{prefix}}',
      GEM_PATH: '{{prefix}}',
    },
    script: [
      {
        run: [
          // Old asciidoctor gemspecs (e.g. 0.1.x) call `s.has_rdoc=` / `s.rubyforge_project=`,
          // both removed from modern RubyGems — strip them so `gem build` doesn't abort
          // with "undefined method 'has_rdoc='".
          'sed -i.bak -e \'/has_rdoc/d\' -e \'/rubyforge_project/d\' asciidoctor.gemspec && rm -f asciidoctor.gemspec.bak',
          '',
          'gem build asciidoctor.gemspec',
          '',
          'gem install \\',
          '  --no-user-install \\',
          '  --bindir={{prefix}}/gems/bin \\',
          '  --no-document \\',
          '  asciidoctor-{{version}}.gem',
          '',
          'mkdir {{prefix}}/bin',
          'mv props/asciidoctor {{prefix}}/bin',
        ].join('\n'),
      },
    ],
  },
}
