import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/gperf",
  name: "gperf",
  programs: [
    "gperf",
  ],
  distributable: {
    url: "https://ftp.gnu.org/gnu/gperf/gperf-{{version.raw}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test -f lib/getline.cc; then\n  sed -i 's/register //g' src/output.cc lib/getline.cc\nelse\n  sed -i 's/register //g' src/output.cc\nfi\n",
        if: "linux",
      },
      "./configure --prefix={{ prefix }}",
      "make --jobs {{ hw.concurrency }} install",
    ],
  },
}
