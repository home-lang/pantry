#!/usr/bin/env bun
/**
 * Publishes Zig source libraries to the pantry S3 registry.
 * These are platform-independent source packages, so we upload the same
 * tarball for all platforms.
 */
import { execSync, spawnSync } from 'node:child_process'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { uploadToS3 } from './upload-to-s3'

const LIBS = [
  { name: 'zig-config', repo: 'zig-utils/zig-config', version: '0.1.0', path: `${process.env.HOME}/Code/Libraries/zig-config` },
  { name: 'zig-cli', repo: 'zig-utils/zig-cli', version: '0.1.0', path: `${process.env.HOME}/Code/Libraries/zig-cli` },
  { name: 'zig-test-framework', repo: 'zig-utils/zig-test-framework', version: '0.1.0', path: `${process.env.HOME}/Code/Libraries/zig-test-framework` },
  { name: 'zig-bump', repo: 'zig-utils/zig-bump', version: '0.1.1', path: `${process.env.HOME}/Code/Libraries/zig-bump` },
]

const PLATFORMS = ['darwin-arm64', 'linux-x86-64']
const BUCKET = 'pantry-registry'
const REGION = 'us-east-1'

async function main() {
  const artifactsDir = '/tmp/zig-lib-artifacts'
  rmSync(artifactsDir, { recursive: true, force: true })
  mkdirSync(artifactsDir, { recursive: true })

  for (const lib of LIBS) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📦 Packaging ${lib.name}@${lib.version}`)
    console.log(`${'='.repeat(60)}`)

    if (!existsSync(lib.path)) {
      console.log(`  ⚠️  ${lib.path} not found, cloning...`)
      execSync(`git clone --depth 1 --branch v${lib.version} https://github.com/${lib.repo}.git ${lib.path}`, { stdio: 'inherit' })
    }

    // Create tarballs for each platform (same content, different platform dirs)
    for (const platform of PLATFORMS) {
      const artifactDir = join(artifactsDir, `${lib.name}-${lib.version}-${platform}`)
      mkdirSync(artifactDir, { recursive: true })

      const tarball = `${lib.name}-${lib.version}.tar.gz`
      // Create tarball from the library source (excluding .git, .zig-cache, zig-out)
      execSync(
        `cd "${lib.path}" && tar -czf "${join(artifactDir, tarball)}" --exclude='.git' --exclude='.zig-cache' --exclude='zig-cache' --exclude='zig-out' --exclude='node_modules' .`,
        { stdio: 'pipe' },
      )
      // Create sha256
      execSync(`cd "${artifactDir}" && shasum -a 256 "${tarball}" > "${tarball}.sha256"`, { stdio: 'pipe' })

      console.log(`  ✓ Created ${platform}/${tarball}`)
    }

    // Upload to S3
    console.log(`  Uploading to S3...`)
    await uploadToS3({
      package: lib.name,
      version: lib.version,
      artifactsDir,
      bucket: BUCKET,
      region: REGION,
    })

    // Clean artifacts for next lib
    for (const platform of PLATFORMS) {
      const artifactDir = join(artifactsDir, `${lib.name}-${lib.version}-${platform}`)
      rmSync(artifactDir, { recursive: true, force: true })
    }
  }

  console.log('\n✅ All libraries published!')
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
