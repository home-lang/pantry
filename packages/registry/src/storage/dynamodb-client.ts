/**
 * Lightweight AWS DynamoDB client using direct API calls
 * Based on ts-cloud patterns - swap to ts-cloud when published
 */

import * as crypto from 'node:crypto'

interface AWSCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}

export interface AttributeValue {
  S?: string
  N?: string
  B?: string
  SS?: string[]
  NS?: string[]
  BS?: string[]
  M?: Record<string, AttributeValue>
  L?: AttributeValue[]
  NULL?: boolean
  BOOL?: boolean
}

export interface KeySchemaElement {
  AttributeName: string
  KeyType: 'HASH' | 'RANGE'
}

export interface AttributeDefinition {
  AttributeName: string
  AttributeType: 'S' | 'N' | 'B'
}

/**
 * DynamoDB client for direct API calls
 */
export class DynamoDBClient {
  private region: string

  constructor(region = 'us-east-1') {
    this.region = region
  }

  private getCredentials(): AWSCredentials {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const sessionToken = process.env.AWS_SESSION_TOKEN

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.')
    }

    return { accessKeyId, secretAccessKey, sessionToken }
  }

  private sign(
    headers: Record<string, string>,
    payload: string,
  ): Record<string, string> {
    const credentials = this.getCredentials()
    const host = `dynamodb.${this.region}.amazonaws.com`
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)

    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex')

    const signedHeaders: Record<string, string> = {
      ...headers,
      'host': host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
    }

    if (credentials.sessionToken) {
      signedHeaders['x-amz-security-token'] = credentials.sessionToken
    }

    // Create canonical request
    const sortedHeaderKeys = Object.keys(signedHeaders).sort()
    const canonicalHeaders = sortedHeaderKeys
      .map(k => `${k.toLowerCase()}:${signedHeaders[k].trim()}`)
      .join('\n')
    const signedHeadersList = sortedHeaderKeys.map(k => k.toLowerCase()).join(';')

    const canonicalRequest = [
      'POST',
      '/',
      '',
      canonicalHeaders,
      '',
      signedHeadersList,
      payloadHash,
    ].join('\n')

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${dateStamp}/${this.region}/dynamodb/aws4_request`
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n')

    // Calculate signature
    const getSignatureKey = (key: string, dateStamp: string, region: string, service: string) => {
      const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest()
      const kRegion = crypto.createHmac('sha256', kDate).update(region).digest()
      const kService = crypto.createHmac('sha256', kRegion).update(service).digest()
      return crypto.createHmac('sha256', kService).update('aws4_request').digest()
    }

    const signingKey = getSignatureKey(credentials.secretAccessKey, dateStamp, this.region, 'dynamodb')
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    const authHeader = `${algorithm} Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`

    return {
      ...signedHeaders,
      'Authorization': authHeader,
    }
  }

  private async request<T>(action: string, params: Record<string, any>): Promise<T> {
    const host = `dynamodb.${this.region}.amazonaws.com`
    const payload = JSON.stringify(params)

    const baseHeaders = {
      'content-type': 'application/x-amz-json-1.0',
      'x-amz-target': `DynamoDB_20120810.${action}`,
    }

    const headers = this.sign(baseHeaders, payload)

    const response = await fetch(`https://${host}/`, {
      method: 'POST',
      headers,
      body: payload,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`DynamoDB ${action} failed: ${response.status} ${text}`)
    }

    return response.json() as T
  }

  /**
   * Put an item into a table
   */
  async putItem(params: {
    TableName: string
    Item: Record<string, AttributeValue>
    ConditionExpression?: string
    ExpressionAttributeNames?: Record<string, string>
    ExpressionAttributeValues?: Record<string, AttributeValue>
  }): Promise<void> {
    await this.request('PutItem', params)
  }

  /**
   * Get an item from a table
   */
  async getItem(params: {
    TableName: string
    Key: Record<string, AttributeValue>
    ProjectionExpression?: string
    ExpressionAttributeNames?: Record<string, string>
  }): Promise<{ Item?: Record<string, AttributeValue> }> {
    return this.request('GetItem', params)
  }

  /**
   * Update an item in a table
   */
  async updateItem(params: {
    TableName: string
    Key: Record<string, AttributeValue>
    UpdateExpression: string
    ExpressionAttributeNames?: Record<string, string>
    ExpressionAttributeValues?: Record<string, AttributeValue>
    ReturnValues?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'
  }): Promise<{ Attributes?: Record<string, AttributeValue> }> {
    return this.request('UpdateItem', params)
  }

  /**
   * Query items from a table
   */
  async query(params: {
    TableName: string
    IndexName?: string
    KeyConditionExpression: string
    FilterExpression?: string
    ProjectionExpression?: string
    ExpressionAttributeNames?: Record<string, string>
    ExpressionAttributeValues?: Record<string, AttributeValue>
    Limit?: number
    ScanIndexForward?: boolean
  }): Promise<{
    Items: Array<Record<string, AttributeValue>>
    Count: number
  }> {
    return this.request('Query', params)
  }

  /**
   * Scan items from a table
   */
  async scan(params: {
    TableName: string
    FilterExpression?: string
    ProjectionExpression?: string
    ExpressionAttributeNames?: Record<string, string>
    ExpressionAttributeValues?: Record<string, AttributeValue>
    Limit?: number
  }): Promise<{
    Items: Array<Record<string, AttributeValue>>
    Count: number
  }> {
    return this.request('Scan', params)
  }

  /**
   * Helper: Marshal a JavaScript object to DynamoDB format
   */
  static marshal(obj: Record<string, any>): Record<string, AttributeValue> {
    const result: Record<string, AttributeValue> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = DynamoDBClient.marshalValue(value)
      }
    }
    return result
  }

  /**
   * Helper: Marshal a single value to DynamoDB format
   */
  static marshalValue(value: any): AttributeValue {
    if (value === null || value === undefined) {
      return { NULL: true }
    }
    if (typeof value === 'string') {
      return { S: value }
    }
    if (typeof value === 'number') {
      return { N: String(value) }
    }
    if (typeof value === 'boolean') {
      return { BOOL: value }
    }
    if (Array.isArray(value)) {
      return { L: value.map(v => DynamoDBClient.marshalValue(v)) }
    }
    if (typeof value === 'object') {
      return { M: DynamoDBClient.marshal(value) }
    }
    return { S: String(value) }
  }

  /**
   * Helper: Unmarshal DynamoDB format to JavaScript object
   */
  static unmarshal(item: Record<string, AttributeValue>): Record<string, any> {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(item)) {
      result[key] = DynamoDBClient.unmarshalValue(value)
    }
    return result
  }

  /**
   * Helper: Unmarshal a single DynamoDB value
   */
  static unmarshalValue(value: AttributeValue): any {
    if (value.S !== undefined)
      return value.S
    if (value.N !== undefined)
      return Number(value.N)
    if (value.BOOL !== undefined)
      return value.BOOL
    if (value.NULL)
      return null
    if (value.L)
      return value.L.map(v => DynamoDBClient.unmarshalValue(v))
    if (value.M)
      return DynamoDBClient.unmarshal(value.M)
    if (value.SS)
      return value.SS
    if (value.NS)
      return value.NS.map(Number)
    return null
  }
}
