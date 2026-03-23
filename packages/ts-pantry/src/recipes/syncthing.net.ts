import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'syncthing.net',
  name: 'syncthing',
  description: 'Open source continuous file synchronization application',
  homepage: 'https://syncthing.net/',
  github: 'https://github.com/syncthing/syncthing',
  programs: ['syncthing'],
  versionSource: {
    type: 'github-releases',
    repo: 'syncthing/syncthing',
  },
  distributable: {
    url: 'https://github.com/syncthing/syncthing/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'if [ -f compat.yaml ] && ! grep -q \'go1.26\' compat.yaml; then',
      '  printf \'\\n- runtime: go1.26\\n  requirements:\\n    darwin: "21"\\n    linux: "3.2"\\n    windows: "10.0"\\n\' >> compat.yaml',
      'fi',
      'go run build.go --version {{version.tag}} --no-upgrade tar',
      'install -D syncthing {{prefix}}/bin/syncthing',
      'cd "${{prefix}}/share/man/man1"',
      'cp $SRCROOT/man/*.1 ./',
      'cd "${{prefix}}/share/man/man5"',
      'cp $SRCROOT/man/*.5 ./',
      'cd "${{prefix}}/share/man/man7"',
      'cp $SRCROOT/man/*.7 ./',
    ],
  },
}
