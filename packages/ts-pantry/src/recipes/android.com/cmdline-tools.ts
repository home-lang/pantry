import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "android.com/cmdline-tools",
  name: "cmdline-tools",
  programs: [
    "apkanalyzer",
    "avdmanager",
    "lint",
    "profgen",
    "resourceshrinker",
    "retrace",
    "screenshot2",
    "sdkmanager",
  ],
  dependencies: {
    'openjdk.org': ">=17",
  },
  buildDependencies: {
    'info-zip.org/unzip': "*",
    'curl.se': "*",
  },
  distributable: undefined,
  build: {
    script: [
      "curl -L \"$DIST_URL\" -o android-commandlinetools.zip",
      "unzip android-commandlinetools.zip",
      {
        run: "mkdir -p libexec/cmdline-tools/latest",
        'working-directory': "${{prefix}}",
      },
      {
        run: "cp -r * {{prefix}}/libexec/cmdline-tools/latest/",
        'working-directory': "cmdline-tools",
      },
      {
        run: "ln -s ../libexec/cmdline-tools/latest/bin/apkanalyzer apkanalyzer\nln -s ../libexec/cmdline-tools/latest/bin/avdmanager avdmanager\nln -s ../libexec/cmdline-tools/latest/bin/lint lint\nln -s ../libexec/cmdline-tools/latest/bin/profgen profgen\nln -s ../libexec/cmdline-tools/latest/bin/resourceshrinker resourceshrinker\nln -s ../libexec/cmdline-tools/latest/bin/retrace retrace\nln -s ../libexec/cmdline-tools/latest/bin/screenshot2 screenshot2\nln -s ../libexec/cmdline-tools/latest/bin/sdkmanager sdkmanager\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      linux: {
        DIST_URL: "https://dl.google.com/android/repository/commandlinetools-linux-{{version.raw}}_latest.zip",
      },
      darwin: {
        DIST_URL: "https://dl.google.com/android/repository/commandlinetools-mac-{{version.raw}}_latest.zip",
      },
    },
  },
  test: {
    script: [
      "echo y | sdkmanager --install \"platforms;android-30\"",
      "cat $ANDROID_HOME/platforms/android-30/source.properties | grep \"AndroidVersion.ApiLevel=30\"",
    ],
  },
}
