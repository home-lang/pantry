/**
 * Pantry Registry S3 Connection Test
 *
 * Tests connection to the pantry-registry S3 bucket using ts-cloud.
 * Requires AWS credentials to be set in environment variables:
 *   - AWS_ACCESS_KEY_ID
 *   - AWS_SECRET_ACCESS_KEY
 *   - AWS_REGION (optional, defaults to us-east-1)
 */

// Import directly from ts-cloud source
import { S3Client } from '/Users/glennmichaeltorregosa/Documents/Projects/ts-cloud/packages/ts-cloud/src/aws/s3'

const BUCKET_NAME = 'pantry-registry'
const REGION = process.env.AWS_REGION || 'us-east-1'

async function testS3Connection(): Promise<void> {
  console.log('='.repeat(50))
  console.log('Pantry Registry S3 Connection Test')
  console.log('='.repeat(50))
  console.log()

  // Check for credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('Missing AWS credentials!')
    console.error('Please set the following environment variables:')
    console.error('  - AWS_ACCESS_KEY_ID')
    console.error('  - AWS_SECRET_ACCESS_KEY')
    console.error()
    console.error('Example:')
    console.error('  export AWS_ACCESS_KEY_ID="your-access-key"')
    console.error('  export AWS_SECRET_ACCESS_KEY="your-secret-key"')
    process.exit(1)
  }

  const s3 = new S3Client({ region: REGION })

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
      await s3.createBucket({ Bucket: BUCKET_NAME })
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
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testData,
      ContentType: 'application/json',
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
    const response = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: testKey,
    })
    const body = await response.Body
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
    const objects = await s3.list({ Bucket: BUCKET_NAME, MaxKeys: 10 })
    console.log(`  ✓ Successfully listed bucket contents`)
    console.log(`  Found ${objects.Contents?.length || 0} objects:`)
    for (const obj of objects.Contents || []) {
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
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: testKey,
    })
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
