import type { Recipe } from '../../scripts/recipe-types'

// ChromeDriver is a vendored, pre-built binary distributed by Google — it is not
// compiled from source. The legacy distribution bucket
// (chromedriver.storage.googleapis.com) is frozen at 114.0.5735.90 (the last
// release before "Chrome for Testing" took over for Chrome 115+). We mirror the
// upstream pkgx recipe (which is flagged `vendored`) and pin to that final
// version so the download URL resolves.
export const recipe: Recipe = {
  domain: 'chromedriver.chromium.org',
  name: 'chromedriver',
  programs: ['chromedriver'],
  platforms: ['darwin', 'linux/x86-64'],
  versionSource: {
    type: 'url-pattern',
    url: 'https://chromedriver.storage.googleapis.com/{{version}}/chromedriver_linux64.zip',
    knownVersions: ['114.0.5735.90'],
  },
  dependencies: {
    linux: {
      'gnome.org/glib': '^2',
      'mozilla.org/nss': '*',
      'x.org/xcb': '*',
    },
  },
  buildDependencies: {
    'gnu.org/wget': '*',
    linux: {
      'info-zip.org/unzip': '*',
    },
  },

  build: {
    env: {
      'darwin/x86-64': {
        SUFFIX: 'mac64',
      },
      'darwin/aarch64': {
        SUFFIX: 'mac_arm64',
      },
      linux: {
        SUFFIX: 'linux64',
      },
    },
    script: [
      'wget https://chromedriver.storage.googleapis.com/{{version.raw}}/chromedriver_${SUFFIX}.zip',
      'unzip chromedriver_${SUFFIX}.zip',
      'mkdir -p {{prefix}}/bin',
      'install chromedriver {{prefix}}/bin/',
    ],
  },
}
