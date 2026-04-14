import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'modal.com',
  name: 'modal',
  description: 'Python client library for Modal',
  homepage: 'https://modal.com/docs',
  github: 'https://github.com/modal-labs/modal-client',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'modal-labs/modal-client',
  },
  distributable: {
    url: 'https://github.com/modal-labs/modal-client/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '1',
  },
  buildDependencies: {
    'python.org': '>=3.9<3.13',
    'protobuf.dev': '*',
  },

  build: {
    script: [
      'python3 -m pip install --break-system-packages "setuptools<78" wheel 2>/dev/null || pip3 install --break-system-packages "setuptools<78" wheel 2>/dev/null || true',
      'bkpyvenv stage {{prefix}} {{version}}',
      'PROTO1=modal_proto/options.proto',
      'PROTO2=modal_proto/options.proto',
      'PROTO1=modal_proto/task_command_router.proto',
      'PROTO2=',
      'source {{prefix}}/venv/bin/activate',
      'pip install grpcio-tools>=1.68.0 grpclib',
      'python -m grpc_tools.protoc --python_out=. --grpclib_python_out=. --grpc_python_out=. -I . modal_proto/api.proto $PROTO1',
      'python -m grpc_tools.protoc --plugin=protoc-gen-modal-grpclib-python=protoc_plugin/plugin.py --modal-grpclib-python_out=. -I . modal_proto/api.proto $PROTO2',
      'pip install .',
      'bkpyvenv seal {{prefix}} modal',
    ],
  },
}
