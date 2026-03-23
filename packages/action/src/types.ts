export interface ActionInputs {
  version: string
  packages: string
  configPath: string
  setupOnly: boolean
  publish: string
  registryUrl: string
  token: string
  discordWebhook: string
  slackWebhook: string
  notificationTitle: string
  notificationMentions: string
}

export interface Platform {
  os: 'darwin' | 'linux' | 'windows'
  arch: 'x64' | 'arm64'
  binaryName: string
  assetName: string
}
