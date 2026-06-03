import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "cairographics.org/pycairo",
  name: "pycairo",
  programs: [],
  dependencies: {
    'cairographics.org': "*",
  },
  buildDependencies: {
    'python.org': "~3.11",
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
  },
  distributable: {
    url: "https://github.com/pygobject/pycairo/releases/download/{{version.tag}}/pycairo-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "python3 setup.py install $ARGS\nmv {{prefix}}/lib/python{{deps.python.org.version.marketing}}/site-packages/*/* {{prefix}}/lib/python{{deps.python.org.version.marketing}}/site-packages/\nmkdir -p {{prefix}}/{lib/pkgconfig,include/pycairo}\ncp $PROP {{prefix}}/lib/pkgconfig/py3cairo.pc\nln -s ../../lib/python{{deps.python.org.version.marketing}}/site-packages/cairo/include/py3cairo.h {{prefix}}/include/pycairo/py3cairo.h",
        if: "<1.27",
      },
      {
        run: "meson setup build $MESON_ARGS\nmeson compile -C build\nmeson install -C build",
        if: ">=1.27",
      },
      {
        run: "ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}",
        'working-directory': "{{prefix}}/lib",
      },
    ],
    env: {
      ARGS: [
        "--verbose",
        "--prefix={{prefix}}",
      ],
      MESON_ARGS: [
        "--prefix={{prefix}}",
      ],
    },
  },
  test: {
    script: [
      "test \"$(pkg-config --modversion py3cairo)\" = \"{{version}}\"",
      "pkg-config --libs py3cairo",
      "cc $FIXTURE -o test -lcairo",
      "./test",
      "python3 -c \"import cairo; print(cairo.version)\" | grep {{version}}",
    ],
  },
}
