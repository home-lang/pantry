import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/allure-framework/allure2',
  name: 'allure2',
  programs: [
    'allure',
  ],
  dependencies: {
    'openjdk.org': '*',
  },
  distributable: {
    url: 'https://repo.maven.apache.org/maven2/io/qameta/allure/allure-commandline/{{version}}/allure-commandline-{{version}}.zip',
    stripComponents: 1,
  },
  build: {
    script: [
      'rm -rf bin/*.bat',
      {
        run: 'mkdir -p bin libexec',
        'working-directory': '${{prefix}}',
      },
      'cp -r ./* {{prefix}}/libexec/',
      {
        run: 'ln -s ../libexec/bin/allure allure',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
  test: {
    script: [
      'allure --version | grep {{version}}',
      'mkdir -p allure-results',
      'cp $FIXTURE allure-results/allure-result.json',
      'allure generate allure-results -o allure-report | grep \'Report successfully generated to allure-report\'',
      'cat allure-report/widgets/summary.json | grep \'"passed":1\'',
    ],
  },
}
