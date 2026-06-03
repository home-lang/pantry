import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "amrdeveloper.github.io/GQL",
  name: "GQL",
  programs: [
    "gitql",
  ],
  dependencies: {
    'libgit2.org': "~1.7",
  },
  buildDependencies: {
    'rust-lang.org': "^1.65",
    'rust-lang.org/cargo': "*",
    'cmake.org': "^3",
  },
  distributable: {
    url: "https://github.com/AmrDeveloper/GQL/archive/refs/tags/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cargo install --path . --root {{prefix}}",
    ],
  },
  test: {
    script: [
      "git clone https://github.com/pkgxdev/pkgx",
      "sed -i -e '/commits/s/name/author_name/g' -e '/commits/s/email/author_email/g' -e '/0 \\.\\. 10/d' $FIXTURE",
      "echo 'exit' >>$FIXTURE\ncat $FIXTURE | gitql --repos pkgx",
      "gitql <$FIXTURE\ngitql -q 'SELECT 1'",
      "sed -i '/FROM/!d' $FIXTURE\ngitql <$FIXTURE\ngitql -q 'SELECT 1 AS just_a_number FROM tags LIMIT 1'",
    ],
  },
}
