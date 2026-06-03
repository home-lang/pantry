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
      // The jbang release archive is a self-contained shell launcher + jar
      // (no compilation). With stripComponents: 1 the top-level jbang-{{version}}/
      // dir is removed, so the extracted payload (bin/, version.txt) lands directly
      // in the build dir ($SRCROOT, which is also the script's cwd) — NOT in
      // {{prefix}} (the install dir, which starts empty).
      //
      // Install the payload under {{prefix}}/libexec, then symlink the launcher
      // into {{prefix}}/bin. The launcher (bin/jbang) resolves its own dir via
      // readlink, so it finds bin/jbang.jar relative to the real (libexec) path.
      // Copy only the known jbang payload — copying $SRCROOT/* wholesale would
      // also drag in buildkit scratch files (props/, _build.sh, etc.).
      'mkdir -p {{prefix}}/libexec {{prefix}}/bin',
      'cp -R "$SRCROOT/bin" {{prefix}}/libexec/',
      '[ -f "$SRCROOT/version.txt" ] && cp "$SRCROOT/version.txt" {{prefix}}/libexec/version.txt || true',
      'chmod +x {{prefix}}/libexec/bin/jbang',
      'cd {{prefix}}/bin',
      'ln -sf ../libexec/bin/jbang jbang',
    ],
  },
}
