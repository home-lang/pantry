import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/XCTestHTMLReport/XCTestHTMLReport',
  platforms: ['darwin'],
  name: 'XCTestHTMLReport',
  programs: [
    'xchtmlreport',
  ],
  distributable: {
    url: 'git+https://github.com/XCTestHTMLReport/XCTestHTMLReport.git',
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/^let version = ".*"/let version = "{{version}}"/\' Version.swift',
        'working-directory': 'Sources/XCTestHTMLReport',
      },
      'swift build --disable-sandbox -c release',
      'install -D .build/release/xchtmlreport {{prefix}}/bin/xchtmlreport',
    ],
  },
  test: {
    script: [
      'xchtmlreport --version',
      'xchtmlreport --version | grep {{version}}',
      'curl -L "${TESTDATA}" | tar -xz',
      'xchtmlreport SanityResults.xcresult',
      'cat index.html | grep "Xcode Testing HTML Report"',
    ],
  },
}
