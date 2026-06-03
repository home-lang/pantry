import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/Virviil/oci2git",
  name: "oci2git",
  programs: [
    "oci2git",
  ],
  buildDependencies: {
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/Virviil/oci2git/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cargo install --path . --locked --root {{prefix}}",
    ],
  },
  test: {
    script: [
      "test \"$(oci2git --version)\" = \"oci2git {{version}}\"",
      "echo '{\"default\": [{\"type\": \"insecureAcceptAnything\"}]}' > policy.json\n",
      "skopeo --policy=policy.json copy docker://busybox@sha256:e56bc0f7fc7d4452b17eb4ac0a9261ff4c9a469afa45d2b673e03650716d095d docker-archive:./busybox.tar",
      "oci2git -e tar -o ./busybox ./busybox.tar",
      "(cd busybox && git log --oneline)",
    ],
  },
}
