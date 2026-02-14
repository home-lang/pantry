#!/usr/bin/env bun

/**
 * Sync Package Metadata to DynamoDB Registry
 *
 * Reads TypeScript package files and upserts metadata into the
 * `pantry-packages` DynamoDB table so the Zig CLI can discover them.
 *
 * Usage:
 *   bun scripts/sync-metadata-to-registry.ts --changed-files packages/ts-pantry/src/packages/bunsh.ts ...
 *   bun scripts/sync-metadata-to-registry.ts --all
 */

import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, basename, relative } from 'node:path'
import { parseArgs } from 'node:util'
import * as crypto from 'node:crypto'

const DYNAMO_TABLE = process.env.DYNAMODB_TABLE || 'pantry-packages'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

interface AWSCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}

function getCredentials(): AWSCredentials {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const sessionToken = process.env.AWS_SESSION_TOKEN

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.')
  }

  return { accessKeyId, secretAccessKey, sessionToken }
}

async function dynamoRequest(action: string, params: Record<string, unknown>): Promise<unknown> {
  const credentials = getCredentials()
  const host = `dynamodb.${AWS_REGION}.amazonaws.com`
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)

  const payload = JSON.stringify(params)
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex')

  const headers: Record<string, string> = {
    'content-type': 'application/x-amz-json-1.0',
    'x-amz-target': `DynamoDB_20120810.${action}`,
    'host': host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  }

  if (credentials.sessionToken) {
    headers['x-amz-security-token'] = credentials.sessionToken
  }

  // AWS Signature V4
  const signedHeaderKeys = Object.keys(headers).sort()
  const signedHeadersStr = signedHeaderKeys.join(';')
  const canonicalHeaders = signedHeaderKeys.map(k => `${k}:${headers[k]}\n`).join('')

  const canonicalRequest = [
    'POST', '/', '', canonicalHeaders, signedHeadersStr, payloadHash,
  ].join('\n')

  const scope = `${dateStamp}/${AWS_REGION}/dynamodb/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, scope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n')

  const hmac = (key: Buffer | string, data: string) =>
    crypto.createHmac('sha256', key).update(data).digest()

  const kDate = hmac(`AWS4${credentials.secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, AWS_REGION)
  const kService = hmac(kRegion, 'dynamodb')
  const kSigning = hmac(kService, 'aws4_request')
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  headers['authorization'] = `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`

  const response = await fetch(`https://${host}/`, {
    method: 'POST',
    headers,
    body: payload,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`DynamoDB ${action} failed: ${response.status} ${text}`)
  }

  return response.json()
}

async function putPackageMetadata(pkg: {
  domain: string
  name: string
  description: string
  latestVersion: string
  programs: string[]
  homepageUrl?: string
  githubUrl?: string
}): Promise<void> {
  const safeName = pkg.domain.replace(/[^a-zA-Z0-9.-]/g, '-')

  await dynamoRequest('PutItem', {
    TableName: DYNAMO_TABLE,
    Item: {
      packageName: { S: pkg.domain },
      safeName: { S: safeName },
      name: { S: pkg.name },
      description: { S: pkg.description || '' },
      latestVersion: { S: pkg.latestVersion },
      programs: { S: JSON.stringify(pkg.programs) },
      homepageUrl: { S: pkg.homepageUrl || '' },
      githubUrl: { S: pkg.githubUrl || '' },
      s3Path: { S: `binaries/${pkg.domain}/metadata.json` },
      updatedAt: { S: new Date().toISOString() },
    },
  })
}

function collectPackageFiles(dir: string): string[] {
  const files: string[] = []

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...collectPackageFiles(fullPath))
    } else if (entry.endsWith('.ts') && entry !== 'index.ts') {
      files.push(fullPath)
    }
  }

  return files
}

async function extractPackageData(filePath: string): Promise<{
  domain: string
  name: string
  description: string
  latestVersion: string
  programs: string[]
  homepageUrl?: string
  githubUrl?: string
} | null> {
  try {
    const content = await Bun.file(filePath).text()

    const domainMatch = content.match(/domain:\s*'([^']+)'/)
    const nameMatch = content.match(/name:\s*'([^']+)'/)
    const descMatch = content.match(/description:\s*'([^']*)'/)
    const homepageMatch = content.match(/homepageUrl:\s*'([^']*)'/)
    const githubMatch = content.match(/githubUrl:\s*'([^']*)'/)

    if (!domainMatch || !nameMatch) return null

    // Extract first version from versions array
    const versionsMatch = content.match(/versions:\s*\[\s*'([^']+)'/)
    const latestVersion = versionsMatch?.[1] || ''

    // Extract programs array
    const programsMatch = content.match(/programs:\s*\[([\s\S]*?)\]\s*as\s*const/)
    const programs: string[] = []
    if (programsMatch) {
      const items = programsMatch[1].matchAll(/'([^']+)'/g)
      for (const item of items) {
        programs.push(item[1])
      }
    }

    return {
      domain: domainMatch[1],
      name: nameMatch[1],
      description: descMatch?.[1] || '',
      latestVersion,
      programs,
      homepageUrl: homepageMatch?.[1],
      githubUrl: githubMatch?.[1],
    }
  } catch (error: any) {
    console.error(`  Failed to parse ${filePath}: ${error.message}`)
    return null
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      'changed-files': { type: 'string', multiple: true },
      all: { type: 'boolean', default: false },
      table: { type: 'string' },
      region: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
    strict: true,
  })

  if (values.help) {
    console.log(`
Sync Package Metadata to DynamoDB Registry

Usage:
  bun scripts/sync-metadata-to-registry.ts --changed-files <file1> <file2> ...
  bun scripts/sync-metadata-to-registry.ts --all
  bun scripts/sync-metadata-to-registry.ts --dry-run --all

Options:
  --changed-files   List of changed package file paths
  --all             Sync all packages
  --table           DynamoDB table name (default: pantry-packages)
  --region          AWS region (default: us-east-1)
  --dry-run         Show what would be synced without writing
  -h, --help        Show this help
`)
    process.exit(0)
  }

  if (values.table) {
    process.env.DYNAMODB_TABLE = values.table
  }
  if (values.region) {
    process.env.AWS_REGION = values.region
  }

  const packagesDir = join(import.meta.dir, '..', 'src', 'packages')

  let filesToSync: string[] = []

  if (values.all) {
    filesToSync = collectPackageFiles(packagesDir)
  } else {
    // Collect from --changed-files and positionals
    const changedFiles = [...(values['changed-files'] || []), ...positionals]
    for (const f of changedFiles) {
      const fullPath = f.startsWith('/') ? f : join(process.cwd(), f)
      if (existsSync(fullPath) && fullPath.endsWith('.ts')) {
        filesToSync.push(fullPath)
      }
    }
  }

  if (filesToSync.length === 0) {
    console.log('No package files to sync.')
    process.exit(0)
  }

  console.log(`Syncing ${filesToSync.length} package(s) to DynamoDB...`)

  let synced = 0
  let failed = 0
  let skipped = 0

  for (const filePath of filesToSync) {
    const pkg = await extractPackageData(filePath)
    if (!pkg) {
      skipped++
      continue
    }

    if (!pkg.latestVersion) {
      skipped++
      continue
    }

    if (values['dry-run']) {
      console.log(`  [dry-run] ${pkg.domain} -> ${pkg.name}@${pkg.latestVersion} (${pkg.programs.length} programs)`)
      synced++
      continue
    }

    try {
      await putPackageMetadata(pkg)
      console.log(`  + ${pkg.domain}@${pkg.latestVersion}`)
      synced++
    } catch (error: any) {
      console.error(`  x ${pkg.domain}: ${error.message}`)
      failed++
    }
  }

  console.log(`\nDone: ${synced} synced, ${skipped} skipped, ${failed} failed`)

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Sync failed:', error.message)
  process.exit(1)
})
