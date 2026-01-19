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
  const profile = process.env.AWS_PROFILE || 'default'
  const configPath = join(homedir(), '.aws', 'config')

  if (!existsSync(configPath)) {
    throw new Error('AWS config file not found at ~/.aws/config. Please run "aws configure" first.')
  }

  const content = readFileSync(configPath, 'utf-8')
  const lines = content.split('\n')

  // For default profile, look for [default]
  // For other profiles, look for [profile <name>]
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

  throw new Error(`No region found for profile "${profile}" in ~/.aws/config`)
}
