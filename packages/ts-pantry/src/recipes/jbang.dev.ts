import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jbang.dev',
  name: 'jbang',
  description: 'Unleash the power of Java - JBang Lets Students, Educators and Professional Developers create, edit and run self-contained source-only Java programs with unprecedented ease.',
  homepage: 'https://jbang.dev/',
  github: 'https://github.com/jbangdev/jbang',
  programs: ['jbang'],
  versionSource: {
    type: 'github-releases',
    repo: 'jbangdev/jbang',
  },
  distributable: {
    url: 'https://github.com/jbangdev/jbang/releases/download/v{{version}}/jbang-{{version}}.zip',
    stripComponents: 1,
  },
  dependencies: {
    'openjdk.org': '*',
  },

  build: {
    script: [
      // The jbang release archive is extracted directly into {{prefix}}
      // (stripComponents: 1 removes the top-level jbang-{{version}}/ dir), so
      // {{prefix}} already holds bin/, lib/, etc. Move the extracted payload
      // into a staging dir first, then relocate it under libexec — copying
      // {{prefix}}/* into {{prefix}}/libexec would otherwise recurse the
      // freshly-created libexec into itself.
      'cd "{{prefix}}"',
      'mkdir -p .jbang-stage',
      // Move every top-level entry (incl. dotfiles) except the staging dir.
      'for entry in * .[!.]*; do [ -e "$entry" ] || continue; [ "$entry" = ".jbang-stage" ] && continue; mv "$entry" .jbang-stage/; done',
      'mkdir -p bin libexec',
      'mv .jbang-stage/* libexec/',
      'rmdir .jbang-stage',
      'cd "{{prefix}}/bin"',
      'ln -s ../libexec/bin/jbang jbang',
    ],
  },
}
