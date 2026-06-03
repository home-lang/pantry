import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/AUTOMATIC1111/stable-diffusion-webui",
  name: "stable-diffusion-webui",
  programs: [
    "stable-diffusion-webui",
  ],
  platforms: ['darwin'],
  dependencies: {
    'python.org': "~3.10",
    'tea.xyz': "^0",
    'git-scm.org': "^2",
    'darwin/x86-64': {
      'google.com/webp': "*",
    },
  },
  buildDependencies: {
    'pip.pypa.io': "*",
    'gnu.org/wget': "*",
    'protobuf.dev': ">=21",
    'rust-lang.org': "^1",
  },
  distributable: {
    url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "echo 'export COMMANDLINE_ARGS=\" --no-download-sd-model --exit $COMMANDLINE_ARGS\"' > webui-user.sh",
      "mkdir -p .git",
      "./webui.sh",
      {
        run: "rm libwebp.7.dylib",
        if: "darwin/x86-64",
        'working-directory': "venv/lib/python3.10/site-packages/PIL/.dylibs",
      },
      {
        run: "install_name_tool -add_rpath @loader_path/../torch/lib venv/lib/python3.10/site-packages/torchvision/image.so",
        if: "darwin",
      },
      "mkdir -p {{prefix}}\ncd {{prefix}}\n",
      "cp -a $SRCROOT lib\nmkdir -p bin\n",
      "cp lib/props/webui-user.sh lib\ncp lib/props/entrypoint.sh .\ncp lib/props/stable-diffusion-webui bin\n",
      {
        run: "sed -i.bak \\\n  -e '/with launch_utils\\.startup_timer\\.subcategory(\"prepare environment\"):/{N;N;N;d;}' \\\n  -e '/if not args\\.skip_prepare_environment:/{N;N;d;}' \\\n  -e '/prepare_environment()/d' \\\n  launch.py\nrm launch.py.bak\n",
        'working-directory': "lib",
      },
      {
        run: "sed -i '/is_dotfile =/s/= .*/= False/' routes.py",
        'working-directory': "lib/venv/lib/python3.10/site-packages/gradio",
      },
      "rm -rf lib/props lib/xyz.tea.* lib/tea.yaml",
      "rm -rf lib/models/Stable-diffusion lib/extensions lib/outputs",
      "find . -name .git\\* | xargs rm -rf",
    ],
  },
  test: {
    script: [
      "stable-diffusion-webui --help",
    ],
  },
}
