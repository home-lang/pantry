import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'swift.org',
  name: 'swift',
  description: 'The Swift Programming Language',
  homepage: 'https://swift.org',
  github: 'https://github.com/apple/swift',
  programs: ['docc', 'dsymutil', 'sourcekit-lsp', 'swift-api-checker.py', 'swift-build-sdk-interfaces', 'swift-build-tool', 'swift-demangle', 'swift-driver', 'swift-format', 'swift-frontend', 'swift-help', 'swift-package', 'swift-plugin-server', 'swift-stdlib-tool', 'swift', 'swift-api-digester', 'swift-api-extract', 'swift-autolink-extract', 'swift-build', 'swift-experimental-sdk', 'swift-package-collection', 'swift-package-registry', 'swift-run', 'swift-symbolgraph-extract', 'swift-test', 'swiftc'],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'apple/swift',
    tagPattern: /\/^swift-\/,\/-RELEASE$\//,
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'curl -SfL "$DOWNLOAD_URL" | tar xzf - --strip-components=2',
      'tar xzf Payload -C {{prefix}}',
      'rm -rf {{prefix}}/_CodeSignature',
      'rm -rf {{prefix}}/Info.plist',
      'cd "${{prefix}}/bin"',
      'ln -sh ../usr/bin/* {{prefix}}/bin',
      'curl -SfL "$DOWNLOAD_URL" | tar xzf - -C {{ prefix }} --strip-components=2',
    ],
  },
}
