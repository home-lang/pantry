/**
 * DynamoDB Connection Test
 * Tests connection to DynamoDB using ts-cloud
 */

import { DynamoDBClient } from 'ts-cloud/aws'
import { getAWSRegion } from './aws-config'

const REGION = getAWSRegion()
const TABLE_NAME = 'pantry-packages'

async function testDynamoDB(): Promise<void> {
  console.log('Testing DynamoDB Connection')
  console.log('='.repeat(40))
  console.log()

  const dynamodb = new DynamoDBClient(REGION)

  // Test 1: List tables
  console.log('1. Listing tables...')
  try {
    const tables = await dynamodb.listTables({})
    console.log(`   Found ${tables.TableNames?.length ?? 0} tables:`)
    for (const table of tables.TableNames ?? []) {
      console.log(`   - ${table}`)
    }
    console.log()
  } catch (err) {
    console.error(`   Error: ${err}`)
    return
  }

  // Test 2: Check if pantry-packages table exists
  console.log(`2. Checking if '${TABLE_NAME}' table exists...`)
  try {
    const tableInfo = await dynamodb.describeTable({ TableName: TABLE_NAME })
    console.log(`   Table exists! Status: ${tableInfo.Table?.TableStatus}`)
    console.log(`   Item count: ${tableInfo.Table?.ItemCount}`)
    console.log()
  } catch (err: any) {
    if (err.message?.includes('ResourceNotFoundException') || err.code === 'ResourceNotFoundException') {
      console.log(`   Table '${TABLE_NAME}' does not exist. Creating...`)
      await createTable(dynamodb)
    } else {
      console.error(`   Error: ${err}`)
      return
    }
  }

  // Test 3: Put a test item
  console.log('3. Testing put/get operations...')
  const testPackage = {
    packageName: 'test-package',
    safeName: 'test-package',
    s3Path: 'packages/test-package/1.0.0/test-package-1.0.0.tgz',
    latestVersion: '1.0.0',
    description: 'A test package',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    await dynamodb.putItem({
      TableName: TABLE_NAME,
      Item: DynamoDBClient.marshal(testPackage),
    })
    console.log('   Put test item successfully')

    // Get it back
    const result = await dynamodb.getItem({
      TableName: TABLE_NAME,
      Key: {
        packageName: { S: 'test-package' },
      },
    })

    if (result.Item) {
      const item = DynamoDBClient.unmarshal(result.Item)
      console.log('   Retrieved item:', item.packageName, '@', item.latestVersion)
    }
    console.log()

    // Clean up test item
    console.log('4. Cleaning up test item...')
    await dynamodb.deleteItem({
      TableName: TABLE_NAME,
      Key: {
        packageName: { S: 'test-package' },
      },
    })
    console.log('   Deleted test item')
    console.log()

  } catch (err) {
    console.error(`   Error: ${err}`)
    return
  }

  console.log('='.repeat(40))
  console.log('DynamoDB connection test completed successfully!')
}

async function createTable(dynamodb: DynamoDBClient): Promise<void> {
  console.log()
  console.log('   Creating pantry-packages table...')

  try {
    await dynamodb.createTable({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'packageName', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'packageName', AttributeType: 'S' },
        { AttributeName: 'safeName', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'SafeNameIndex',
          KeySchema: [
            { AttributeName: 'safeName', KeyType: 'HASH' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      Tags: [
        { Key: 'project', Value: 'pantry' },
        { Key: 'environment', Value: 'production' },
      ],
    })

    console.log('   Table created! Waiting for it to become active...')

    // Wait for table to be active
    let status = 'CREATING'
    while (status !== 'ACTIVE') {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const info = await dynamodb.describeTable({ TableName: TABLE_NAME })
      status = info.Table?.TableStatus ?? 'UNKNOWN'
      console.log(`   Status: ${status}`)
    }

    console.log('   Table is now active!')
    console.log()
  } catch (err) {
    console.error(`   Failed to create table: ${err}`)
    throw err
  }
}

testDynamoDB().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
