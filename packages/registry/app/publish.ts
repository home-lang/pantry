/**
 * Pantry Publish Command
 *
 * Packs the package and uploads it to the pantry-registry S3 bucket.
 * Usage: bun run publish.ts [directory]
 */

import { existsSync, readFileSync, statSync, unlinkSync } from 'node:fs'
import { join, basename } from 'node:path'
import { S3Client, DynamoDBClient } from 'ts-cloud/aws'
import { getAWSRegion } from './aws-config'

// Import pack function
import { spawn } from 'node:child_process'

interface PackageJson {
  name: string
  version: string
  description?: string
  author?: string | { name: string; email?: string }
  license?: string
  keywords?: string[]
  repository?: string | { type: string; url: string }
  homepage?: string
}

const BUCKET_NAME = 'pantry-registry'
const TABLE_NAME = 'pantry-packages'
const REGION = getAWSRegion()

async function publish(targetDir: string = process.cwd()): Promise<void> {
  console.log('🚀 Pantry Publish')
  console.log('='.repeat(40))
  console.log()

  // Check for package.json
  const packageJsonPath = join(targetDir, 'package.json')
  if (!existsSync(packageJsonPath)) {
    console.error('❌ No package.json found in', targetDir)
    process.exit(1)
  }

  // Read package.json
  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  if (!packageJson.name) {
    console.error('❌ package.json is missing "name" field')
    process.exit(1)
  }

  if (!packageJson.version) {
    console.error('❌ package.json is missing "version" field')
    process.exit(1)
  }

  console.log(`📋 Package: ${packageJson.name}`)
  console.log(`📋 Version: ${packageJson.version}`)
  console.log()

  // Step 1: Run pack to create tarball
  console.log('📦 Creating tarball...')
  const packResult = await runPack(targetDir)
  if (!packResult.success) {
    console.error('❌ Failed to create tarball')
    process.exit(1)
  }

  const tarballPath = packResult.tarballPath!
  const tarballName = basename(tarballPath)
  const stats = statSync(tarballPath)
  const sizeKB = (stats.size / 1024).toFixed(2)

  console.log(`   ✓ Created ${tarballName} (${sizeKB} KB)`)
  console.log()

  // Step 2: Upload to S3
  console.log('☁️  Uploading to registry...')

  const s3 = new S3Client(REGION)

  // Determine S3 key structure: packages/{name}/{version}/{tarball}
  const safeName = packageJson.name.replace('@', '').replace('/', '-')
  const s3Key = `packages/${safeName}/${packageJson.version}/${tarballName}`

  try {
    // Read tarball as buffer
    const tarballContent = readFileSync(tarballPath)

    // Upload tarball
    await s3.putObject({
      bucket: BUCKET_NAME,
      key: s3Key,
      body: tarballContent,
      contentType: 'application/gzip',
    })
    console.log(`   ✓ Uploaded ${s3Key}`)

    // Also upload/update package metadata
    const metadataKey = `packages/${safeName}/metadata.json`
    const metadata = await getOrCreateMetadata(s3, safeName, packageJson)

    // Add this version to metadata
    metadata.versions[packageJson.version] = {
      tarball: s3Key,
      publishedAt: new Date().toISOString(),
      size: stats.size,
    }
    metadata.latest = packageJson.version
    metadata.updatedAt = new Date().toISOString()

    await s3.putObject({
      bucket: BUCKET_NAME,
      key: metadataKey,
      body: JSON.stringify(metadata, null, 2),
      contentType: 'application/json',
    })
    console.log(`   ✓ Updated ${metadataKey}`)

    // Also update DynamoDB index for package lookup
    console.log()
    console.log('📊 Updating registry index...')
    const dynamodb = new DynamoDBClient(REGION)

    const dbRecord = {
      packageName: packageJson.name,
      safeName,
      s3Path: s3Key,
      latestVersion: packageJson.version,
      description: packageJson.description || '',
      author: typeof packageJson.author === 'string'
        ? packageJson.author
        : packageJson.author?.name || '',
      license: packageJson.license || '',
      keywords: packageJson.keywords || [],
      repository: typeof packageJson.repository === 'string'
        ? packageJson.repository
        : packageJson.repository?.url || '',
      homepage: packageJson.homepage || '',
      updatedAt: new Date().toISOString(),
    }

    // Check if package exists to preserve createdAt
    const existingItem = await dynamodb.getItem({
      TableName: TABLE_NAME,
      Key: { packageName: { S: packageJson.name } },
    })

    if (!existingItem.Item) {
      (dbRecord as any).createdAt = new Date().toISOString()
    } else {
      const existing = DynamoDBClient.unmarshal(existingItem.Item)
      (dbRecord as any).createdAt = existing.createdAt || new Date().toISOString()
    }

    await dynamodb.putItem({
      TableName: TABLE_NAME,
      Item: DynamoDBClient.marshal(dbRecord),
    })
    console.log(`   ✓ Updated registry index for ${packageJson.name}`)
  } catch (err) {
    console.error(`   ❌ Upload failed: ${err}`)
    process.exit(1)
  }

  // Step 3: Clean up local tarball
  console.log()
  console.log('🧹 Cleaning up...')
  try {
    unlinkSync(tarballPath)
    console.log(`   ✓ Removed local tarball`)
  } catch {
    console.log(`   ⚠ Could not remove local tarball`)
  }

  console.log()
  console.log('='.repeat(40))
  console.log('✅ Published successfully!')
  console.log()
  console.log(`   📦 ${packageJson.name}@${packageJson.version}`)
  console.log(`   🔗 s3://${BUCKET_NAME}/${s3Key}`)
  console.log(`   📊 Indexed in ${TABLE_NAME}`)
  console.log()
  console.log('Install with:')
  console.log(`   pantry install ${packageJson.name}`)
  console.log()
}

interface PackageMetadata {
  name: string
  description?: string
  author?: string
  license?: string
  keywords?: string[]
  repository?: string
  homepage?: string
  latest: string
  versions: Record<string, {
    tarball: string
    publishedAt: string
    size: number
  }>
  createdAt: string
  updatedAt: string
}

async function getOrCreateMetadata(
  s3: S3Client,
  safeName: string,
  packageJson: PackageJson
): Promise<PackageMetadata> {
  const metadataKey = `packages/${safeName}/metadata.json`

  try {
    const existing = await s3.getObject(BUCKET_NAME, metadataKey)
    const parsed = JSON.parse(existing)

    // Check if it's valid metadata format (has versions field)
    if (parsed.versions && typeof parsed.versions === 'object') {
      return parsed as PackageMetadata
    }

    // Invalid format, create new metadata
    throw new Error('Invalid metadata format')
  } catch {
    // Create new metadata
    const author = typeof packageJson.author === 'string'
      ? packageJson.author
      : packageJson.author?.name

    const repository = typeof packageJson.repository === 'string'
      ? packageJson.repository
      : packageJson.repository?.url

    return {
      name: packageJson.name,
      description: packageJson.description,
      author,
      license: packageJson.license,
      keywords: packageJson.keywords,
      repository,
      homepage: packageJson.homepage,
      latest: '',
      versions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

function runPack(targetDir: string): Promise<{ success: boolean; tarballPath?: string }> {
  return new Promise((resolve) => {
    const packScript = join(import.meta.dir, 'pack.ts')
    const proc = spawn('bun', ['run', packScript, targetDir], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        // Extract tarball path from output
        const match = stdout.match(/📦\s+(\S+\.tgz)/)
        if (match) {
          const tarballName = match[1]
          resolve({
            success: true,
            tarballPath: join(targetDir, tarballName),
          })
        } else {
          resolve({ success: false })
        }
      } else {
        console.error(stderr)
        resolve({ success: false })
      }
    })

    proc.on('error', () => {
      resolve({ success: false })
    })
  })
}

// Run if called directly
const targetDir = process.argv[2] || process.cwd()
publish(targetDir).catch((err) => {
  console.error('Failed to publish:', err)
  process.exit(1)
})
