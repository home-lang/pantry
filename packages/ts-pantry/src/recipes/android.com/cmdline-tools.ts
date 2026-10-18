import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'android.com/cmdline-tools',
  name: 'cmdline-tools',
  propsDir: '../props/android.com/cmdline-tools',
  programs: [
    'apkanalyzer',
    'avdmanager',
    'lint',
    'profgen',
    'resourceshrinker',
    'retrace',
    'screenshot2',
    'sdkmanager',
  ],
  dependencies: {
    'openjdk.org': '>=17',
  },
  buildDependencies: {
    'info-zip.org/unzip': '*',
    'curl.se': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'curl -L "$DIST_URL" -o android-commandlinetools.zip',
      'unzip android-commandlinetools.zip',
      {
        run: 'mkdir -p libexec/cmdline-tools/latest',
        'working-directory': '${{prefix}}',
      },
      {
        run: 'cp -r * {{prefix}}/libexec/cmdline-tools/latest/',
        'working-directory': 'cmdline-tools',
      },
      // The official Gradle launchers expand this property through eval.
      // Quote its value so an installed SDK path with spaces remains one argument.
      'for launcher in "{{prefix}}"/libexec/cmdline-tools/latest/bin/*; do',
      '  sed -i.bak -f "{{srcroot}}/props/quote-tools-dir.sed" "$launcher"',
      '  rm "$launcher.bak"',
      'done',
      {
        run: 'ln -s ../libexec/cmdline-tools/latest/bin/apkanalyzer apkanalyzer\nln -s ../libexec/cmdline-tools/latest/bin/avdmanager avdmanager\nln -s ../libexec/cmdline-tools/latest/bin/lint lint\nln -s ../libexec/cmdline-tools/latest/bin/profgen profgen\nln -s ../libexec/cmdline-tools/latest/bin/resourceshrinker resourceshrinker\nln -s ../libexec/cmdline-tools/latest/bin/retrace retrace\nln -s ../libexec/cmdline-tools/latest/bin/screenshot2 screenshot2\nln -s ../libexec/cmdline-tools/latest/bin/sdkmanager sdkmanager\n',
        'working-directory': '${{prefix}}/bin',
      },
      // APK Analyzer constructs its native build-tools provider even for help.
      // Provision a real, private SDK fixture with this managed sdkmanager;
      // the fixture lives outside the published prefix.
      'export ANDROID_HOME="{{srcroot}}/_health-sdk"',
      'mkdir -p "$ANDROID_HOME"',
      'printf \'y\\n%.0s\' {1..100} | "{{prefix}}/bin/sdkmanager" --sdk_root="$ANDROID_HOME" "build-tools;35.0.0"',
    ],
    env: {
      linux: {
        DIST_URL: 'https://dl.google.com/android/repository/commandlinetools-linux-{{version.major}}_latest.zip',
      },
      darwin: {
        DIST_URL: 'https://dl.google.com/android/repository/commandlinetools-mac-{{version.major}}_latest.zip',
      },
    },
    skip: [
      'verify-foreign-artifact',
    ],
  },
  test: {
    required: true,
    script: [
      'export ANDROID_HOME="{{srcroot}}/_health-sdk"',
      'sdkmanager --version >/dev/null',
      'apkanalyzer --help >/dev/null',
    ],
  },
}
