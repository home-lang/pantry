import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'miniupnp.free.fr',
  name: 'miniupnp.free.fr',
  programs: ['external-ip', 'upnp-listdevices', 'upnpc'],
  distributable: {
    url: 'https://miniupnp.tuxfamily.org/files/download.php?file=miniupnpc-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'make INSTALLPREFIX={{prefix}} install',
    ],
  },
}
