/**
 * Pantry Package Lookup
 *
 * Looks up package info from DynamoDB registry index.
 * Usage: bun run lookup.ts <package-name>
 */

import { DynamoDBClient } from 'ts-cloud/aws'
import { getAWSRegion } from './aws-config'

const TABLE_NAME = 'pantry-packages'
const REGION = getAWSRegion()

export interface PackageInfo {
  packageName: string
  safeName: string
  s3Path: string
  latestVersion: string
  description: string
  author: string
  license: string
  keywords: string[]
  repository: string
  homepage: string
  createdAt: string
  updatedAt: string
}

/**
 * Look up a package by its name
 */
export async function lookupPackage(packageName: string): Promise<PackageInfo | null> {
  const dynamodb = new DynamoDBClient(REGION)

  const result = await dynamodb.getItem({
    TableName: TABLE_NAME,
    Key: { packageName: { S: packageName } },
  })

  if (!result.Item) {
    return null
  }

  return DynamoDBClient.unmarshal(result.Item) as PackageInfo
}

/**
 * Look up a package by its safe name (S3 folder name)
 */
export async function lookupPackageBySafeName(safeName: string): Promise<PackageInfo | null> {
  const dynamodb = new DynamoDBClient(REGION)

  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    IndexName: 'SafeNameIndex',
    KeyConditionExpression: 'safeName = :safeName',
    ExpressionAttributeValues: {
      ':safeName': { S: safeName },
    },
    Limit: 1,
  })

  if (!result.Items || result.Items.length === 0) {
    return null
  }

  return DynamoDBClient.unmarshal(result.Items[0]) as PackageInfo
}

/**
 * List all packages in the registry
 */
export async function listPackages(): Promise<PackageInfo[]> {
  const dynamodb = new DynamoDBClient(REGION)

  const result = await dynamodb.scan({
    TableName: TABLE_NAME,
  })

  return (result.Items || []).map((item) => DynamoDBClient.unmarshal(item) as PackageInfo)
}

/**
 * Search packages by keyword
 */
export async function searchPackages(query: string): Promise<PackageInfo[]> {
  const dynamodb = new DynamoDBClient(REGION)

  // Note: DynamoDB doesn't support full-text search natively
  // For a production system, you'd want to use OpenSearch or similar
  // For now, we scan and filter client-side
  const result = await dynamodb.scan({
    TableName: TABLE_NAME,
  })

  const lowerQuery = query.toLowerCase()
  return (result.Items || [])
    .map((item) => DynamoDBClient.unmarshal(item) as PackageInfo)
    .filter((pkg: PackageInfo) =>
      pkg.packageName.toLowerCase().includes(lowerQuery) ||
      pkg.description?.toLowerCase().includes(lowerQuery) ||
      pkg.keywords?.some((k: string) => k.toLowerCase().includes(lowerQuery))
    )
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage:')
    console.log('  bun run lookup.ts <package-name>     Look up a specific package')
    console.log('  bun run lookup.ts --list             List all packages')
    console.log('  bun run lookup.ts --search <query>   Search packages')
    process.exit(0)
  }

  if (args[0] === '--list') {
    console.log('Listing all packages in the registry...\n')
    const packages = await listPackages()
    if (packages.length === 0) {
      console.log('No packages found.')
    } else {
      for (const pkg of packages) {
        console.log(`  ${pkg.packageName}@${pkg.latestVersion}`)
        if (pkg.description) {
          console.log(`    ${pkg.description}`)
        }
        console.log()
      }
      console.log(`Total: ${packages.length} packages`)
    }
    return
  }

  if (args[0] === '--search') {
    const query = args[1]
    if (!query) {
      console.error('Please provide a search query')
      process.exit(1)
    }
    console.log(`Searching for "${query}"...\n`)
    const packages = await searchPackages(query)
    if (packages.length === 0) {
      console.log('No packages found.')
    } else {
      for (const pkg of packages) {
        console.log(`  ${pkg.packageName}@${pkg.latestVersion}`)
        if (pkg.description) {
          console.log(`    ${pkg.description}`)
        }
        console.log()
      }
      console.log(`Found: ${packages.length} packages`)
    }
    return
  }

  // Look up specific package
  const packageName = args[0]
  console.log(`Looking up package: ${packageName}\n`)

  const pkg = await lookupPackage(packageName)

  if (!pkg) {
    console.log(`Package "${packageName}" not found in registry.`)
    process.exit(1)
  }

  console.log('Package Information:')
  console.log('='.repeat(40))
  console.log(`  Name:        ${pkg.packageName}`)
  console.log(`  Version:     ${pkg.latestVersion}`)
  console.log(`  Safe Name:   ${pkg.safeName}`)
  console.log(`  S3 Path:     ${pkg.s3Path}`)
  if (pkg.description) console.log(`  Description: ${pkg.description}`)
  if (pkg.author) console.log(`  Author:      ${pkg.author}`)
  if (pkg.license) console.log(`  License:     ${pkg.license}`)
  if (pkg.keywords?.length) console.log(`  Keywords:    ${pkg.keywords.join(', ')}`)
  if (pkg.repository) console.log(`  Repository:  ${pkg.repository}`)
  if (pkg.homepage) console.log(`  Homepage:    ${pkg.homepage}`)
  console.log(`  Created:     ${pkg.createdAt}`)
  console.log(`  Updated:     ${pkg.updatedAt}`)
  console.log()
  console.log('Install with:')
  console.log(`  pantry install ${pkg.packageName}`)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
