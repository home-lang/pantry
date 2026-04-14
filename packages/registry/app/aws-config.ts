/**
 * AWS Config Reader
 *
 * Reads AWS region from ~/.aws/config file (same as AWS CLI)
 */

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * Get AWS region from ~/.aws/config
 */
export function getAWSRegion(): string {
  // 1. Environment variables take precedence (AWS_REGION or AWS_DEFAULT_REGION)
  if (process.env.AWS_REGION) return process.env.AWS_REGION
  if (process.env.AWS_DEFAULT_REGION) return process.env.AWS_DEFAULT_REGION

  // 2. Try reading ~/.aws/config
  const profile = process.env.AWS_PROFILE || 'default'
  const configPath = join(homedir(), '.aws', 'config')

  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8')
      const lines = content.split('\n')
      const profileHeader = profile === 'default' ? '[default]' : `[profile ${profile}]`

      let inProfile = false
      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith('[')) {
          inProfile = trimmed === profileHeader
          continue
        }

        if (inProfile && trimmed.startsWith('region')) {
          const match = trimmed.match(/^region\s*=\s*(.+)$/)
          if (match) {
            return match[1].trim()
          }
        }
      }
    }
    catch { /* fall through to default */ }
  }

  // 3. Fall back to us-east-1 as safe default
  return 'us-east-1'
}
