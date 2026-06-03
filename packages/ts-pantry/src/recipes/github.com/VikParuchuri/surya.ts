import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/VikParuchuri/surya",
  name: "surya",
  programs: [
    "surya_detect",
  ],
  dependencies: {
    'pkgx.sh': ">=1",
    linux: {
      'mesa3d.org': "^23.3",
      'gnome.org/glib': "^2",
      'mupdf.com': "*",
    },
  },
  buildDependencies: {
    'python.org': "~3.11",
    'python-poetry.org': "^1.7",
  },
  distributable: {
    url: "git+https://github.com/VikParuchuri/surya.git",
  },
  build: {
    script: [
      {
        run: "bkpyvenv stage --engine=poetry {{prefix}} {{version}}",
        if: "<0.20",
      },
      {
        run: "bkpyvenv stage {{prefix}} {{version}}",
        if: ">=0.20",
      },
      {
        run: "if test \"{{hw.platform}}\" = \"darwin\"; then\n  poetry config --local installer.no-binary opencv-python\nfi\n",
        if: "<0.20",
      },
      {
        run: "if test \"{{hw.platform}}/{{hw.arch}}\" = \"darwin/x86-64\"; then\n  sed -i 's/^torch.*/torch = \"=2.2.2\"/' pyproject.toml\n  poetry lock\nfi\n",
        if: ">=0.4.4<0.20",
      },
      {
        run: "if test \"{{hw.platform}}/{{hw.arch}}\" = \"linux/aarch64\"; then\n  poetry add 'pymupdf==1.25.2'\nfi\n",
        if: "<0.20",
      },
      {
        run: "poetry install",
        if: "<0.20",
      },
      {
        run: "${{prefix}}/venv/bin/pip install .",
        if: ">=0.20",
      },
      {
        run: "poetry add 'numpy<2'",
        if: ">=0.5<0.20",
      },
      {
        run: "bkpyvenv seal --engine=poetry {{prefix}} surya_detect",
        if: "<0.20",
      },
      {
        run: "bkpyvenv seal {{prefix}} surya_detect",
        if: ">=0.20",
      },
    ],
  },
  test: {
    script: [
      "curl -L \"https://raw.githubusercontent.com/VikParuchuri/surya/{{version.tag}}/static/images/excerpt.png\" -o test.png",
      "surya_detect ./test.png --images",
      "grep -F '\"bboxes\": [{' results/surya/test/results.json\n",
      "grep -F '\"confidence\":' results/surya/test/results.json\n",
    ],
  },
}
