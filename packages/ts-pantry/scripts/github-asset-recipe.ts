/** Build-time verification against GitHub's digest for the exact public asset. */
export function githubAssetSteps(repository: string, tag: string, asset: string, filename: string): string[] {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)
    || repository.split('/').some(part => part === '.' || part === '..')
    || tag === '.' || tag === '..' || asset.startsWith('.')
    || !/^[A-Za-z0-9_.{}+-]+$/.test(tag)
    || !/^[A-Za-z0-9_.{}+-]+$/.test(asset)
    || !/^[A-Za-z0-9_.-]+$/.test(filename) || filename.startsWith('.'))
    throw new Error('Invalid GitHub recipe asset coordinates')
  return [
    `curl -fsSL --retry 2 'https://api.github.com/repos/${repository}/releases/tags/${tag}' -o release.json`,
    `DIGEST=$(jq -er --arg asset '${asset}' '.assets[] | select(.name == $asset) | .digest | strings | select(test("^sha256:[0-9a-f]{64}$")) | ltrimstr("sha256:")' release.json)`,
    `curl -fsSL --retry 2 'https://github.com/${repository}/releases/download/${tag}/${asset}' -o '${filename}'`,
    `printf '%s  %s\n' "$DIGEST" '${filename}' | sha256sum --check --status`,
  ]
}

export const githubAssetBuildDependencies = {
  'curl.se': '*',
  'stedolan.github.io/jq': '^1',
  'gnu.org/coreutils': '*',
}
