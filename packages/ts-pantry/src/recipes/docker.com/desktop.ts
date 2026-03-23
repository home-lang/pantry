import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'docker.com/desktop',
  name: 'Docker Desktop',
  description: 'A desktop application for building and sharing containerized applications.',
  homepage: 'https://docker.com',
  programs: ['docker-desktop'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
    'if test "{{hw.arch}}" = "aarch64"; then ARCH="arm64"; else ARCH="amd64"; fi',
    'curl -fSL "https://desktop.docker.com/mac/main/${ARCH}/Docker.dmg" -o /tmp/docker.dmg',
    'hdiutil attach /tmp/docker.dmg -mountpoint /tmp/docker-mount -nobrowse -quiet',
    'mkdir -p "{{prefix}}"',
    'cp -R "/tmp/docker-mount/Docker.app" "{{prefix}}/Docker.app"',
    'hdiutil detach /tmp/docker-mount -quiet || true',
    'mkdir -p "{{prefix}}/bin"',
    'ln -sf "../Docker.app/Contents/Resources/bin/docker" "{{prefix}}/bin/docker-desktop"',
    ],
  },
}
