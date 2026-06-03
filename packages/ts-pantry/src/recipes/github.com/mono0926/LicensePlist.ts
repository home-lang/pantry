import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/mono0926/LicensePlist",
  name: "LicensePlist",
  programs: [
    "license-plist",
  ],
  buildDependencies: {
    'swift.org': 6,
  },
  distributable: {
    url: "https://github.com/mono0926/LicensePlist/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "make install PREFIX={{prefix}}",
    ],
  },
  test: {
    script: [
      "if test \"$(sw_vers -productVersion | cut -d . -f 1)\" -lt 15; then\n  exit 0\nfi\n",
      "test ! -z \"${LICENSE_PLIST_GITHUB_TOKEN}\" || unset LICENSE_PLIST_GITHUB_TOKEN",
      "echo 'github \"realm/realm-swift\" \"v10.20.2\"' > Cartfile.resolved",
      "license-plist --suppress-opening-directory | tee out",
      "grep 'None 🎉' out",
    ],
  },
}
