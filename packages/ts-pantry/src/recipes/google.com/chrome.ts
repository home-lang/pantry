import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/chrome',
  name: 'chrome-for-testing',
  description: 'Versioned Chrome for server browser automation',
  homepage: 'https://developer.chrome.com/docs/chromedriver/downloads',
  programs: ['google-chrome-stable'],
  platforms: ['linux/x86-64'],
  versionSource: {
    type: 'custom',
    async fetch() {
      const response = await fetch('https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json')
      if (!response.ok) throw new Error(`Chrome version discovery failed: ${response.status}`)
      const manifest = await response.json() as { channels: { Stable: { version: string } } }
      return [manifest.channels.Stable.version]
    },
  },
  dependencies: {
    'gnome.org/glib': '^2',
    'mozilla.org/nspr': '^4',
    'mozilla.org/nss': '^3',
    'gnome.org/atk': '^2',
    'freedesktop.org/at-spi2-atk': '^2',
    'freedesktop.org/dbus': '^1',
    'openprinting.github.io/cups': '^2',
    'libexpat.github.io': '^2',
    'x.org/xcb': '^1',
    'xkbcommon.org': '^1',
    'alsa-project.org/alsa-lib': '^1',
    'mesa3d.org': '^26',
    'dri.freedesktop.org': '^2',
    'x.org/x11': '^1',
    'x.org/exts': '^1',
    'cairographics.org': '^1',
    'gnome.org/pango': '^1',
    'systemd.io': '^257',
    'x.org/xcomposite': '^0',
    'x.org/xdamage': '^1',
    'x.org/xfixes': '^6',
    'x.org/xrandr': '^1',
  },
  buildDependencies: { 'info-zip.org/unzip': '*' },
  build: {
    script: [
      'curl -fSL "https://storage.googleapis.com/chrome-for-testing-public/{{version}}/linux64/chrome-linux64.zip" -o chrome.zip',
      'unzip -q chrome.zip',
      'mkdir -p {{prefix}}/lib {{prefix}}/bin',
      'cp -a chrome-linux64 {{prefix}}/lib/chrome-for-testing',
      'ln -s ../lib/chrome-for-testing/chrome {{prefix}}/bin/google-chrome-stable',
      // NSS opens these providers dynamically, outside the ELF DT_NEEDED graph.
      'cp {{deps.mozilla.org/nss.prefix}}/lib/libsoftokn3.so {{deps.mozilla.org/nss.prefix}}/lib/libfreebl3.so {{prefix}}/lib/',
    ],
  },
  test: {
    script: ['google-chrome-stable --version'],
    required: true,
  },
}
