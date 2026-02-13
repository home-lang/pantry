#!/usr/bin/env bun

/**
 * Upload Package Binaries to S3
 *
 * Uploads built package tarballs to the pantry-registry S3 bucket.
 * Uses ts-cloud for AWS S3 operations.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { createHash } from 'node:crypto'
import { S3Client } from '@stacksjs/ts-cloud/aws'

interface UploadOptions {
  package: string
  version: string
  artifactsDir: string
  bucket: string
  region: string
}

interface PackageMetadata {
  name: string
  latestVersion: string
  versions: Record<string, {
    platforms: Record<string, {
      tarball: string
      sha256: string
      size: number
      uploadedAt: string
    }>
  }>
  updatedAt: string
}

async function uploadToS3(options: UploadOptions): Promise<void> {
  const { package: pkgName, version, artifactsDir, bucket, region } = options

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Uploading ${pkgName} ${version} to S3`)
  console.log(`${'='.repeat(60)}`)
  console.log(`   Bucket: ${bucket}`)
  console.log(`   Region: ${region}`)

  // Initialize S3 client
  const s3 = new S3Client(region)

  // Find all artifact directories
  if (!existsSync(artifactsDir)) {
    throw new Error(`Artifacts directory not found: ${artifactsDir}`)
  }

  const artifactDirs = readdirSync(artifactsDir).filter(name => {
    const fullPath = join(artifactsDir, name)
    return statSync(fullPath).isDirectory()
  })

  if (artifactDirs.length === 0) {
    throw new Error('No artifact directories found')
  }

  console.log(`\n📦 Found ${artifactDirs.length} artifacts to upload`)

  // S3 key structure: packages/pantry/{domain}/{version}/{platform}/{filename}
  const uploadedPlatforms: Record<string, { tarball: string; sha256: string; size: number }> = {}

  for (const artifactDir of artifactDirs) {
    const artifactPath = join(artifactsDir, artifactDir)
    const files = readdirSync(artifactPath)

    // Find tarball and sha256 files
    const tarball = files.find(f => f.endsWith('.tar.gz'))
    const sha256File = files.find(f => f.endsWith('.sha256'))

    if (!tarball) {
      console.log(`⚠️  No tarball found in ${artifactDir}, skipping`)
      continue
    }

    // Extract platform from artifact name (e.g., "php-net-8.4.11-darwin-arm64")
    const match = artifactDir.match(/-(darwin|linux)-(arm64|x86-64)$/)
    if (!match) {
      console.log(`⚠️  Could not determine platform from ${artifactDir}, skipping`)
      continue
    }
    const platform = `${match[1]}-${match[2]}`

    console.log(`\n📤 Uploading ${platform}...`)

    // Read tarball
    const tarballPath = join(artifactPath, tarball)
    const tarballContent = readFileSync(tarballPath)
    const tarballSize = statSync(tarballPath).size

    // Calculate SHA256 if not provided
    let sha256Hash: string
    if (sha256File) {
      const sha256Content = readFileSync(join(artifactPath, sha256File), 'utf-8')
      sha256Hash = sha256Content.split(' ')[0].trim()
    } else {
      sha256Hash = createHash('sha256').update(tarballContent).digest('hex')
    }

    // S3 keys
    const tarballKey = `binaries/${pkgName}/${version}/${platform}/${tarball}`
    const sha256Key = `binaries/${pkgName}/${version}/${platform}/${tarball}.sha256`

    // Upload tarball using ts-cloud
    console.log(`   📁 Uploading ${tarball} (${(tarballSize / 1024 / 1024).toFixed(2)} MB)`)
    await s3.putObject({
      bucket,
      key: tarballKey,
      body: tarballContent,
      contentType: 'application/gzip',
    })
    console.log(`   ✓ Uploaded to s3://${bucket}/${tarballKey}`)

    // Upload SHA256
    await s3.putObject({
      bucket,
      key: sha256Key,
      body: `${sha256Hash}  ${tarball}\n`,
      contentType: 'text/plain',
    })
    console.log(`   ✓ Uploaded SHA256`)

    uploadedPlatforms[platform] = {
      tarball: tarballKey,
      sha256: sha256Hash,
      size: tarballSize,
    }
  }

  // Update metadata
  console.log(`\n📊 Updating package metadata...`)

  const metadataKey = `binaries/${pkgName}/metadata.json`
  let metadata: PackageMetadata

  try {
    const existingMetadata = await s3.getObject(bucket, metadataKey)
    metadata = JSON.parse(existingMetadata)
    console.log(`   Found existing metadata`)
  } catch {
    // Create new metadata
    metadata = {
      name: pkgName,
      latestVersion: version,
      versions: {},
      updatedAt: new Date().toISOString(),
    }
    console.log(`   Creating new metadata`)
  }

  // Update version info
  if (!metadata.versions[version]) {
    metadata.versions[version] = { platforms: {} }
  }

  for (const [platform, info] of Object.entries(uploadedPlatforms)) {
    metadata.versions[version].platforms[platform] = {
      tarball: info.tarball,
      sha256: info.sha256,
      size: info.size,
      uploadedAt: new Date().toISOString(),
    }
  }

  metadata.latestVersion = version
  metadata.updatedAt = new Date().toISOString()

  // Upload metadata using ts-cloud's putObjectJson helper
  await s3.putObject({
    bucket,
    key: metadataKey,
    body: JSON.stringify(metadata, null, 2),
    contentType: 'application/json',
  })
  console.log(`   ✓ Updated metadata at s3://${bucket}/${metadataKey}`)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ Upload complete!`)
  console.log(`${'='.repeat(60)}`)
  console.log(`\n📦 ${pkgName}@${version}`)
  console.log(`   Platforms: ${Object.keys(uploadedPlatforms).join(', ')}`)
  console.log(`   Metadata: s3://${bucket}/${metadataKey}`)
}

// CLI entry point
async function main() {
  const { values } = parseArgs({
    options: {
      package: { type: 'string', short: 'p' },
      version: { type: 'string', short: 'v' },
      'artifacts-dir': { type: 'string' },
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
    },
    strict: true,
  })

  if (!values.package || !values.version || !values['artifacts-dir'] || !values.bucket) {
    console.error('Usage: upload-to-s3.ts --package <domain> --version <version> --artifacts-dir <dir> --bucket <bucket> [--region <region>]')
    console.error('Example: upload-to-s3.ts --package php.net --version 8.4.11 --artifacts-dir ./artifacts --bucket pantry-registry')
    process.exit(1)
  }

  await uploadToS3({
    package: values.package,
    version: values.version,
    artifactsDir: values['artifacts-dir'],
    bucket: values.bucket,
    region: values.region || 'us-east-1',
  })
}

main().catch((error) => {
  console.error('❌ Upload failed:', error.message)
  process.exit(1)
})
