#!/usr/bin/env bun
/**
 * Migrate pantry.dev site infrastructure to canonical ts-cloud naming:
 *   Stack:  pantry-sh-main-static-site  →  pantry-production-main-site
 *   Bucket: pantry-dev-site           →  pantry-production-site
 *
 * CloudFront distribution and OAC are imported into the new stack (no DNS change).
 */

import { resolve } from 'node:path'
import cloudConfig from '../.config/cloud.ts'
import {
  buildSiteStackMigrationPlan,
  deleteStackRetainResources,
  deployRetainPoliciesToStack,
  importSiteStack,
  resolveSiteCertificateArn,
  syncSiteBucket,
  uploadSiteAssets,
} from '../../../Libraries/ts-cloud/packages/ts-cloud/src/deploy/migrate-site-stack.ts'
import { generateExternalDnsStaticSiteTemplate } from '../../../Libraries/ts-cloud/packages/ts-cloud/src/deploy/static-site-external-dns.ts'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'

const config = (cloudConfig as { default?: typeof cloudConfig }).default ?? cloudConfig
const environment = 'production' as const
const region = 'us-east-1'

const OLD_STACK = 'pantry-sh-main-static-site'
const OLD_BUCKET = 'pantry-dev-site'
const DISTRIBUTION_ID = 'E35L7VG3GQG66J'
const OAC_ID = 'E2B41B8U3RQKOF'

const outputDir = resolve(import.meta.dir, '../.cloud-migration')

async function main(): Promise<void> {
  console.log('=== Pantry production site stack migration ===\n')

  const certArn = await resolveSiteCertificateArn('pantry.dev', region)
  console.log(`ACM certificate: ${certArn}`)

  const site = config.sites!.main
  const compute = config.infrastructure?.compute
  const domain = site.domain!
  const wwwDomain = `www.${domain}`

  mkdirSync(outputDir, { recursive: true })

  // 1. Retain policies on legacy stack (matches current physical resources)
  console.log('\n[1/7] Adding Retain policies to legacy stack...')
  const retainTemplate = generateExternalDnsStaticSiteTemplate({
    bucketName: OLD_BUCKET,
    domain,
    aliases: [domain, wwwDomain],
    certificateArn: certArn,
    passthroughUrls: true,
    dynamicApp: !!compute?.cloudFrontOriginDomain,
    computeOriginDomain: compute?.cloudFrontOriginDomain,
    computeOriginPort: compute?.cloudFrontOriginPort ?? 3000,
    computeOriginId: compute?.cloudFrontOriginId ?? 'pantry-site-ec2',
    retainOnStackDelete: true,
  })
  const retainPath = resolve(outputDir, 'retain-stack-template.json')
  writeFileSync(retainPath, JSON.stringify(retainTemplate, null, 2))
  await deployRetainPoliciesToStack(OLD_STACK, retainPath, region)
  console.log('  ✓ Retain policies applied')

  // 2. Delete legacy stack (resources kept)
  console.log('\n[2/7] Deleting legacy stack (resources retained)...')
  await deleteStackRetainResources(OLD_STACK, region)
  console.log('  ✓ Legacy stack deleted')

  // 3. New S3 bucket + sync
  const plan = buildSiteStackMigrationPlan({
    config: {
      ...config,
      sites: {
        main: {
          ...site,
          bucket: undefined,
          stackName: undefined,
        },
      },
    },
    environment,
    siteKey: 'main',
    oldStackName: OLD_STACK,
    oldBucket: OLD_BUCKET,
    distributionId: DISTRIBUTION_ID,
    oacId: OAC_ID,
    outputDir,
    certificateArn: certArn,
  })
  writeFileSync(plan.templatePath, readFileSync(plan.templatePath, 'utf8').replace('PLACEHOLDER_CERT', certArn))

  console.log(`\n[3/7] Syncing S3: ${OLD_BUCKET} → ${plan.newBucket}...`)
  await syncSiteBucket(OLD_BUCKET, plan.newBucket, region)
  console.log('  ✓ Bucket synced')

  // 4. Import CloudFront + OAC into new stack; create new S3 + policy
  console.log(`\n[4/7] Creating stack ${plan.newStackName} (import + create)...`)
  await importSiteStack(plan, region)
  console.log('  ✓ Stack ready')

  // 5. Upload install script assets
  console.log('\n[5/7] Uploading site assets...')
  await uploadSiteAssets(plan, resolve(import.meta.dir, '../public'), region)
  console.log('  ✓ Assets uploaded')

  // 6. Verify
  console.log('\n[6/7] Verifying pantry.dev...')
  const { execSync } = await import('node:child_process')
  const postCode = execSync(
    `curl -s -o /dev/null -w '%{http_code}' -X POST https://${domain}/auth/login -H 'Content-Type: application/json' --data '{"email":"x","password":"y"}'`,
    { encoding: 'utf8' },
  )
  if (postCode.trim() !== '401') {
    throw new Error(`Expected POST /auth/login → 401, got ${postCode}`)
  }
  console.log('  ✓ POST /auth/login → 401')

  // 7. Remove legacy bucket
  console.log(`\n[7/7] Removing legacy bucket ${OLD_BUCKET}...`)
  execSync(`aws s3 rb s3://${OLD_BUCKET} --force --region ${region}`, { stdio: 'inherit' })
  console.log('  ✓ Legacy bucket removed')

  console.log('\n=== Migration complete ===')
  console.log(`  Stack:  ${plan.newStackName}`)
  console.log(`  Bucket: ${plan.newBucket}`)
  console.log(`  CDN:    ${DISTRIBUTION_ID}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
