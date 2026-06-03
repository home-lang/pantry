import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/ed",
  name: "ed",
  programs: [
    "ed",
  ],
  buildDependencies: {
    'curl.se': "*",
    'nongnu.org/lzip': "*",
  },
  distributable: undefined,
  build: {
    script: [
      "curl -L \"https://ftp.gnu.org/gnu/ed/ed-{{version.raw}}.tar.lz\" | lzip -d | tar -x --strip-components=1",
      "./configure --prefix={{prefix}}",
      "make",
      "make install",
    ],
  },
  test: {
    script: [
      "echo \"Hello world\\n\" > test",
      "ed test <<EOF\ni\nAdditional line\n.\nw\nq\nEOF\n",
      "cat test | grep \"Additional line\"",
      "ed --version | grep {{version}}",
    ],
  },
}
