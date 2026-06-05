import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'taskfile.dev',
  name: 'task',
  description: 'A task runner / simpler Make alternative written in Go',
  homepage: 'https://taskfile.dev',
  github: 'https://github.com/go-task/task',
  programs: ['task'],
  versionSource: {
    type: 'github-releases',
    repo: 'go-task/task',
  },
  // Prebuilt download: task ships official per-platform release tarballs
  // (bare `task` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="task_darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="task_darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="task_linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="task_linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo task.tar.gz "https://github.com/go-task/task/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf task.tar.gz',
      'install -Dm755 task {{prefix}}/bin/task',
    ],
  },
}
