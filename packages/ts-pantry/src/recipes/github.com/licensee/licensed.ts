import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: '../../props/github.com/licensee/licensed',
  domain: 'github.com/licensee/licensed',
  name: 'licensed',
  github: 'https://github.com/licensee/licensed',
  programs: [
    'licensed',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'licensee/licensed',
  },
  dependencies: {
    'ruby-lang.org': '~3.4',
    'rubygems.org': '*',
    'linux': {
      'gnu.org/which': '*',
    },
  },
  buildDependencies: {
    'cmake.org': '^4',
    'tukaani.org/xz': '*',
  },
  distributable: {
    url: 'git+https://github.com/licensee/licensed.git',
    ref: '${{version.tag}}',
  },
  build: {
    script: [
      'bundle config set without development test',
      'bundle install',
      {
        run: 'gem uninstall nokogiri --all --ignore-dependencies\ngem install nokogiri -v 1.18.8 --platform=ruby',
        if: 'linux',
      },
      'gem build licensed.gemspec',
      'gem install --no-user-install --bindir={{prefix}}/gems/bin --no-document licensed-{{version}}.gem racc',
      'install -Dm755 props/licensed {{prefix}}/bin/licensed',
    ],
    env: {
      GEM_HOME: '${{prefix}}',
      GEM_PATH: '${{prefix}}',
      BUNDLE_VERSION: 'system',
    },
  },
  test: {
    script: [
      'licensed --help',
    ],
  },
}
