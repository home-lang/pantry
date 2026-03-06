/**
 * AWS Lambda handler for the Pantry Registry
 *
 * Adapts API Gateway HTTP API v2 events to standard Request/Response
 * used by the registry handler.
 */

import { createRegistryFromEnv } from './registry'
import { createAnalytics } from './analytics'
import { createHandler } from './server'
import { createZigStorage } from './zig-routes'

// Initialize once (reused across warm invocations)
const registry = createRegistryFromEnv()
const analytics = createAnalytics(
  process.env.DYNAMODB_ANALYTICS_TABLE
    ? { tableName: process.env.DYNAMODB_ANALYTICS_TABLE, region: process.env.AWS_REGION || 'us-east-1' }
    : undefined,
)
const zigStorage = createZigStorage()
const baseUrl = process.env.BASE_URL || 'https://registry.pantry.dev'
const handler = createHandler(registry, analytics, zigStorage, baseUrl)

interface APIGatewayV2Event {
  version: string
  routeKey: string
  rawPath: string
  rawQueryString: string
  headers: Record<string, string>
  requestContext: {
    http: {
      method: string
      path: string
      sourceIp: string
    }
    domainName: string
  }
  body?: string
  isBase64Encoded?: boolean
}

interface LambdaResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
  isBase64Encoded: boolean
}

export async function handler_fn(event: APIGatewayV2Event): Promise<LambdaResponse> {
  const method = event.requestContext.http.method
  const path = event.rawPath
  const queryString = event.rawQueryString ? `?${event.rawQueryString}` : ''
  const domain = event.requestContext.domainName || 'registry.pantry.dev'
  const url = `https://${domain}${path}${queryString}`

  // Build headers
  const headers = new Headers()
  for (const [key, value] of Object.entries(event.headers || {})) {
    headers.set(key, value)
  }

  // Build body
  let body: BodyInit | undefined
  if (event.body) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body
  }

  // Create standard Request
  const request = new Request(url, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
  })

  // Call the handler
  const response = await handler(request)

  // Convert Response to Lambda format
  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  const contentType = response.headers.get('content-type') || ''
  const isBinary = contentType.includes('application/gzip')
    || contentType.includes('application/octet-stream')
    || contentType.includes('image/')

  let responseBody: string
  if (isBinary) {
    const buffer = await response.arrayBuffer()
    responseBody = Buffer.from(buffer).toString('base64')
  }
  else {
    responseBody = await response.text()
  }

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: responseBody,
    isBase64Encoded: isBinary,
  }
}

// Export as the Lambda handler name
export { handler_fn as handler }
