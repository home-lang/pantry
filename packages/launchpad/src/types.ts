import type { Path } from './path'
import type { Version } from './version'

export interface LaunchpadConfig {
  verbose: boolean
}

// Types based on previous implementation
export interface Installation {
  path: Path
  pkg: {
    project: string
    version: Version
  }
}

export interface JsonResponse {
  runtime_env: Record<string, Record<string, string>>
  pkgs: Installation[]
  env: Record<string, Record<string, string>>
  pkg: Installation
}
