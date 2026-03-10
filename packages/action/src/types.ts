export interface ActionInputs {
  version: string
  packages: string
  configPath: string
  setupOnly: boolean
}

export interface Platform {
  os: 'darwin' | 'linux' | 'windows'
  arch: 'x64' | 'arm64'
  binaryName: string
  assetName: string
}
