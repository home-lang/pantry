import type { Recipe } from '../../../../scripts/recipe-types'

// DOWNLOAD recipe: the old recipe source-built a FROZEN 2023 fork
// (zanussbaum/gpt4all.cpp) and was wrongly skip-listed as "abandoned". Real
// upstream (nomic-ai/gpt4all) ships official installers on every release — a Qt
// Installer Framework `.run` on linux-x64 and a `.dmg` on macOS — so we download
// the official prebuilt and extract the app instead. Download-first.
//
// linux-arm64 ships only a Windows-arm .exe upstream, so it's unsupported here.
export const recipe: Recipe = {
  domain: 'github.com/nomic-ai/gpt4all',
  name: 'gpt4all',
  homepage: 'https://gpt4all.io',
  github: 'https://github.com/nomic-ai/gpt4all',
  platforms: [
    'linux/x86-64',
    'darwin/aarch64',
    'darwin/x86-64',
  ],
  programs: ['gpt4all'],
  versionSource: {
    type: 'github-releases',
    repo: 'nomic-ai/gpt4all',
  },
  build: {
    script: [
      'VERSION={{version}}',
      'BASE="https://github.com/nomic-ai/gpt4all/releases/download/v${VERSION}"',
      'if test "{{hw.platform}}" = "linux"; then',
      '  curl -Lfo installer.run "${BASE}/gpt4all-installer-linux-v${VERSION}.run"',
      '  chmod +x installer.run',
      '  # Qt Installer Framework headless install (offscreen so no display needed).',
      '  QT_QPA_PLATFORM=minimal ./installer.run in --root "{{prefix}}/opt/gpt4all" \\',
      '    --accept-licenses --accept-obligations --default-answer --confirm-command',
      '  mkdir -p {{prefix}}/bin',
      '  BIN=$(find "{{prefix}}/opt/gpt4all" -type f -name chat -o -type f -name gpt4all | head -1)',
      '  ln -sf "$BIN" {{prefix}}/bin/gpt4all',
      'else',
      '  curl -Lfo gpt4all.dmg "${BASE}/gpt4all-installer-macos-v${VERSION}.dmg"',
      '  hdiutil attach -nobrowse -quiet gpt4all.dmg -mountpoint /tmp/g4a-mnt',
      '  mkdir -p {{prefix}}/opt {{prefix}}/bin',
      '  cp -R /tmp/g4a-mnt/*.app {{prefix}}/opt/ || cp -R /tmp/g4a-mnt/* {{prefix}}/opt/',
      '  hdiutil detach -quiet /tmp/g4a-mnt',
      '  BIN=$(find "{{prefix}}/opt" -type f -perm -111 -name "gpt4all*" | head -1)',
      '  ln -sf "$BIN" {{prefix}}/bin/gpt4all',
      'fi',
    ],
  },
}
