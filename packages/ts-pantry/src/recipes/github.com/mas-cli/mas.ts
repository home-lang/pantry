import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/mas-cli/mas",
  name: "mas",
  programs: [
    "mas",
  ],
  distributable: {
    url: "https://github.com/mas-cli/mas/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "zsh $PROP >Package.swift",
        'working-directory': "Sources/mas/Utilities",
      },
      {
        run: "sed 's/enum Package/extension MAS/' Package.swift >MAS+BuildInformation.swift\nrm Package.swift\nsed -i -e 's/\\.plugin(name: \"MASBuildToolPlugin\")//' ../../../Package.swift",
        if: ">=3",
        'working-directory': "Sources/mas/Utilities",
      },
      "swift build --configuration release",
      "install -D .build/release/mas {{prefix}}/bin/mas",
    ],
  },
}
