import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git-scm.org',
  name: 'git',
  description: 'Git Source Code Mirror - This is a publish-only repository but pull requests can be turned into patches to the mailing list via GitGitGadget (https://gitgitgadget.github.io/). Please follow Documentation/SubmittingPatches procedure for any of your improvements.',
  github: 'https://github.com/git/git',
  programs: ['git', 'git-cvsserver', 'git-receive-pack', 'git-shell', 'git-upload-archive', 'git-upload-pack', 'scalar', 'git-credential-osxkeychain'],
  versionSource: {
    type: 'github-releases',
    repo: 'git/git',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://mirrors.edge.kernel.org/pub/software/scm/git/git-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'mv props/config.mak .',
      './configure',
      'make install --jobs {{ hw.concurrency }} NO_TCLTK=1',
      'run:',
      'run:',
      'run: mv git-subtree "{{prefix}}"/libexec',
      'run: fix-shebangs.ts bin/* libexec/*',
      'run: cp "$SRCROOT"/props/gitconfig "$SRCROOT"/props/gitignore .',
      'run:',
      'pkgx --sync',
      'run:',
      'cd $(mktemp -d)',
      'run:',
      'git config user.email "you@example.com"',
      'git config user.name "Your Name"',
      'git commit --message "test"',
      'git subtree add --prefix teaxyz-subtree https://github.com/teaxyz/white-paper main --squash',
      'git gone --version',
    ],
  },
}
