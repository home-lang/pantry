import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "ceph.com/cephadm",
  name: "cephadm",
  programs: [
    "cephadm",
  ],
  dependencies: {
    'openssl.org': "^1.1",
    'python.org': "^3",
  },
  buildDependencies: {
    'python.org': "^3",
    'gnu.org/coreutils': "*",
  },
  distributable: {
    url: "git+https://github.com/ceph/ceph.git",
  },
  build: {
    script: [
      "mkdir -p {{prefix}}/bin",
      {
        run: "./build.sh $BUILD_FLAGS {{prefix}}/bin/cephadm",
        'working-directory': "src/cephadm",
      },
      {
        run: "shebang_length=$(head -n 1 {{prefix}}/bin/cephadm | wc -c)\nnew_shebang=\"#!/usr/bin/env python3\"\npadding_length=$((shebang_length - ${#new_shebang}))\nif [ $padding_length -lt 0 ]; then\n  echo \"Error: New shebang is too long!\" >&2\n  exit 1\nfi\n\npadding=$(printf '%*s' \"$padding_length\" '')\nsed -i \"1s|^#!.*$|${new_shebang}${padding}|\" cephadm",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      linux: {
        TMPDIR: "$(mktemp -d -p /tmp)",
      },
      BUILD_FLAGS: [
        "--set-version-var CEPH_GIT_VER=\"$(git rev-parse HEAD)\"",
        "--set-version-var CEPH_GIT_NICE_VER=\"$(git describe)\"",
        "--set-version-var CEPH_RELEASE=\"$(sed -n '1p' ./src/ceph_release)\"",
        "--set-version-var CEPH_RELEASE_NAME=\"$(sed -n '2p' ./src/ceph_release)\"",
        "--set-version-var CEPH_RELEASE_TYPE=\"$(sed -n '3p' ./src/ceph_release)\"",
      ],
    },
  },
}
