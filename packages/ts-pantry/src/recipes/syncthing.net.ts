import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
      // syncthing's build.go runs writeCompatJSON() which log.Fatal's if the
      // building Go's runtime.Version() (e.g. "go1.26") has no matching prefix
      // entry in compat.yaml. CI builds Go from latest source via go.dev, which
      // is often newer than the Go versions syncthing's release shipped knows
      // about. Inject an entry for the actual building toolchain if absent.
      'GOVER=$(go env GOVERSION 2>/dev/null || go version | awk \'{print $3}\')',
      'GOVER=${GOVER%%-*}',
      'if [ -f compat.yaml ] && [ -n "$GOVER" ] && ! grep -q "runtime: $GOVER\\$" compat.yaml; then',
      '  printf "\\n- runtime: %s\\n  requirements:\\n    darwin: \\"21\\"\\n    linux: \\"3.2\\"\\n    windows: \\"10.0\\"\\n" "$GOVER" >> compat.yaml',
      'fi',
      'go run build.go --version {{version.tag}} --no-upgrade tar',
      'install -D syncthing {{prefix}}/bin/syncthing',
      { run: 'cp $SRCROOT/man/*.1 ./', 'working-directory': '{{prefix}}/share/man/man1' },
      { run: 'cp $SRCROOT/man/*.5 ./', 'working-directory': '{{prefix}}/share/man/man5' },
      { run: 'cp $SRCROOT/man/*.7 ./', 'working-directory': '{{prefix}}/share/man/man7' },
    ],
  },
}
