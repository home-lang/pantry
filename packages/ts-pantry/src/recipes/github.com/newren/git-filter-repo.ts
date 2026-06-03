import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/newren/git-filter-repo",
  name: "git-filter-repo",
  programs: [
    "git-filter-repo",
  ],
  dependencies: {
    'python.org': ">=3.6",
  },
  distributable: {
    url: "https://github.com/newren/git-filter-repo/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "install -D git-filter-repo {{prefix}}/bin/git-filter-repo",
    ],
  },
  test: {
    script: [
      "git clone https://github.com/pkgxdev/pantry",
      "git filter-repo --path projects/pkgx.sh\ntest \"$(find projects | grep -v projects/pkgx.sh)\" = \"projects\"",
    ],
  },
}
