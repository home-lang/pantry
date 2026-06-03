import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "aquasecurity.github.io/tfsec",
  name: "tfsec",
  programs: [
    "tfsec",
  ],
  buildDependencies: {
    'go.dev': ">=1.19",
  },
  distributable: {
    url: "git+https://github.com/aquasecurity/tfsec.git",
  },
  build: {
    script: [
      "scripts/install.sh v{{version}}",
      "mkdir -p {{prefix}}/bin",
      "install tfsec {{prefix}}/bin/",
    ],
  },
  test: {
    script: [
      "mkdir -p good bad",
      "cat <<EOF > good/main.tf\nresource \"aws_alb_listener\" \"my-alb-listener\" {\n  port     = \"443\"\n  protocol = \"HTTPS\"\n}\nEOF\n",
      "cat <<EOF > bad/main.tf\nresource \"aws_security_group_rule\" \"world\" {\n  description = \"A security group triggering tfsec AWS006.\"\n  type        = \"ingress\"\n  cidr_blocks = [\"0.0.0.0/0\"]\n}\nEOF\n",
      "tfsec good | grep 'No problems'",
      "tfsec bad || true",
      "tfsec --version | grep {{version}}",
    ],
  },
}
