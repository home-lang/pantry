/**
 * Pantry Registry S3 Connection Test
 *
 * Tests connection to the pantry-registry S3 bucket using ts-cloud.
 * Credentials and region are loaded from ~/.aws/credentials and ~/.aws/config
 */

import { S3Client } from 'ts-cloud/aws'
import { getAWSRegion } from './aws-config'

const BUCKET_NAME = 'pantry-registry'
const REGION = getAWSRegion()

async function testS3Connection(): Promise<void> {
  console.log('='.repeat(50))
  console.log('Pantry Registry S3 Connection Test')
  console.log('='.repeat(50))
  console.log()

  const s3 = new S3Client(REGION)

  console.log(`Region: ${REGION}`)
  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log()

  // Test 1: Check if bucket exists
  console.log('[1/4] Checking if bucket exists...')
  try {
    const exists = await s3.bucketExists(BUCKET_NAME)
    if (exists) {
      console.log(`  ✓ Bucket "${BUCKET_NAME}" exists`)
    } else {
      console.log(`  ✗ Bucket "${BUCKET_NAME}" does not exist`)
      console.log('  Creating bucket...')
      await s3.createBucket(BUCKET_NAME)
      console.log(`  ✓ Bucket "${BUCKET_NAME}" created`)
    }
  } catch (err) {
    console.error(`  ✗ Error checking bucket: ${err}`)
    process.exit(1)
  }
  console.log()

  // Test 2: Write a test object
  console.log('[2/4] Writing test object...')
  const testKey = '_test/connection-test.json'
  const testData = JSON.stringify({
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Pantry registry connection test',
  }, null, 2)

  try {
    await s3.putObject({
      bucket: BUCKET_NAME,
      key: testKey,
      body: testData,
      contentType: 'application/json',
    })
    console.log(`  ✓ Successfully wrote "${testKey}"`)
  } catch (err) {
    console.error(`  ✗ Error writing object: ${err}`)
    process.exit(1)
  }
  console.log()

  // Test 3: Read the test object back
  console.log('[3/4] Reading test object...')
  try {
    const body = await s3.getObject(BUCKET_NAME, testKey)
    console.log(`  ✓ Successfully read "${testKey}"`)
    console.log(`  Content: ${body}`)
  } catch (err) {
    console.error(`  ✗ Error reading object: ${err}`)
    process.exit(1)
  }
  console.log()

  // Test 4: List bucket contents
  console.log('[4/4] Listing bucket contents...')
  try {
    const objects = await s3.list({ bucket: BUCKET_NAME, maxKeys: 10 })
    console.log(`  ✓ Successfully listed bucket contents`)
    console.log(`  Found ${objects?.length || 0} objects:`)
    for (const obj of objects || []) {
      console.log(`    - ${obj.Key} (${obj.Size} bytes)`)
    }
  } catch (err) {
    console.error(`  ✗ Error listing bucket: ${err}`)
    process.exit(1)
  }
  console.log()

  // Cleanup: Delete test object
  console.log('Cleaning up test object...')
  try {
    await s3.deleteObject(BUCKET_NAME, testKey)
    console.log(`  ✓ Deleted "${testKey}"`)
  } catch (err) {
    console.log(`  ⚠ Could not delete test object: ${err}`)
  }
  console.log()

  console.log('='.repeat(50))
  console.log('All tests passed! S3 connection is working.')
  console.log('='.repeat(50))
}

// Run the test
testS3Connection().catch((err) => {
  console.error('Test failed with error:', err)
  process.exit(1)
})
