import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "code.videolan.org/rist/librist",
  name: "librist",
  programs: [
    "rist2rist",
    "ristreceiver",
    "ristsender",
    "ristsrppasswd",
  ],
  buildDependencies: {
    'mesonbuild.com': 1,
    'ninja-build.org': 1,
    linux: {
      'sourceware.org/libffi': 3,
    },
  },
  distributable: {
    url: "https://code.videolan.org/rist/librist/-/archive/v{{version}}/librist-v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test \"{{hw.platform}}\" = \"darwin\"; then\n  sed -i -e 's/generation = (buf\\.st_mtim\\.tv_sec << 32).*/generation = buf.st_mtime << 32;/' srp_shared.c\nfi\n",
        if: "^0.2.8",
        'working-directory': "../tools",
      },
      {
        run: "sed -i '/^if (host_machine.system() == '\\''darwin'\\'')/,/^endif$/s/^/# /' meson.build",
        if: "darwin",
        'working-directory': "..",
      },
      "meson .. --prefix={{prefix}} --libdir={{prefix}}/lib --buildtype=release",
      "ninja -v",
      "ninja install",
    ],
    env: {
      CC: "clang",
    },
  },
}
