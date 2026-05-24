#!/usr/bin/env bun
/**
 * Provision or update a pantry.dev admin account (DynamoDB).
 *
 * Usage:
 *   DYNAMODB_TABLE=pantry-registry bun run scripts/upsert-admin.ts chris@pantry.dev 'YourPassword' 'Chris'
 */
import { AuthService, createAuthStorage } from '../src/auth'

const email = process.argv[2]
const password = process.argv[3]
const name = process.argv[4] || 'Admin'

if (!email || !password) {
  console.error('Usage: bun run scripts/upsert-admin.ts <email> <password> [name]')
  process.exit(1)
}

const table = process.env.DYNAMODB_TABLE
if (!table || table === 'local') {
  console.error('Set DYNAMODB_TABLE to the production metadata table name')
  process.exit(1)
}

const region = process.env.AWS_REGION || 'us-east-1'
const auth = new AuthService(createAuthStorage(table, region))

const user = await auth.upsertAdminUser(email, name, password)
console.log(JSON.stringify({ ok: true, user }, null, 2))
