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
    // pkgx pins ~3.4, but Ruby 3.4 is the only differentiator vs every other
    // gem recipe here (rubocop/fastlane/cocoapods all use 3.1–3.3 and build
    // racc's native extension fine). Under our toolchain, racc 1.8.x's native
    // ext fails to compile against Ruby 3.4 headers — hence the prior
    // skip-list entry "racc gem native extension build failure". licensed's
    // gemspec only requires Ruby >= 3.1.0, and nokogiri 1.18.8 + racc 1.8.1
    // are compatible with 3.3, so resolve to a known-good 3.3.x instead.
    'ruby-lang.org': '>=3.1<3.4',
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
