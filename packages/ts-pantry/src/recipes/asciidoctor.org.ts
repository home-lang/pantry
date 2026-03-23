import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
    script: [
      'gem build asciidoctor.gemspec',
      '',
      'gem install \\',
      '  --no-user-install \\',
      '  --bindir={{prefix}}/gems/bin \\',
      '  --no-document \\',
      '  asciidoctor-{{version}}.gem',
      '',
      'mkdir "{{prefix}}"/bin',
      'mv props/asciidoctor "{{prefix}}"/bin',
      '',
    ],
    env: {
      'GEM_HOME': '${{prefix}}',
      'GEM_PATH': '${{prefix}}',
    },
  },
}
