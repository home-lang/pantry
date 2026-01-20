/**
 * Type declarations for ts-cloud/aws module
 * This allows TypeScript to understand the linked ts-cloud package
 */

declare module 'ts-cloud/aws' {
  export class S3Client {
    constructor(region: string)
    bucketExists(bucket: string): Promise<boolean>
    createBucket(bucket: string): Promise<void>
    putObject(params: {
      bucket: string
      key: string
      body: string | Buffer
      contentType?: string
    }): Promise<void>
    getObject(bucket: string, key: string): Promise<string>
    deleteObject(bucket: string, key: string): Promise<void>
    list(params: { bucket: string; maxKeys?: number }): Promise<Array<{ Key: string; Size: number }> | null>
  }

  export class DynamoDBClient {
    constructor(region: string)

    static marshal(item: Record<string, unknown>): Record<string, AttributeValue>
    static unmarshal(item: Record<string, AttributeValue>): Record<string, unknown>

    listTables(params: object): Promise<{ TableNames: string[] }>
    describeTable(params: { TableName: string }): Promise<{
      Table: { TableStatus: string; ItemCount: number }
    }>
    createTable(params: CreateTableInput): Promise<void>
    putItem(params: { TableName: string; Item: Record<string, AttributeValue> }): Promise<void>
    getItem(params: {
      TableName: string
      Key: Record<string, AttributeValue>
    }): Promise<{ Item?: Record<string, AttributeValue> }>
    deleteItem(params: {
      TableName: string
      Key: Record<string, AttributeValue>
    }): Promise<void>
    query(params: {
      TableName: string
      IndexName?: string
      KeyConditionExpression: string
      ExpressionAttributeValues: Record<string, AttributeValue>
      Limit?: number
    }): Promise<{ Items?: Array<Record<string, AttributeValue>> }>
    scan(params: { TableName: string }): Promise<{ Items?: Array<Record<string, AttributeValue>> }>
  }

  interface AttributeValue {
    S?: string
    N?: string
    B?: Uint8Array
    SS?: string[]
    NS?: string[]
    BS?: Uint8Array[]
    M?: Record<string, AttributeValue>
    L?: AttributeValue[]
    NULL?: boolean
    BOOL?: boolean
  }

  interface CreateTableInput {
    TableName: string
    KeySchema: Array<{ AttributeName: string; KeyType: 'HASH' | 'RANGE' }>
    AttributeDefinitions: Array<{ AttributeName: string; AttributeType: 'S' | 'N' | 'B' }>
    BillingMode?: 'PROVISIONED' | 'PAY_PER_REQUEST'
    GlobalSecondaryIndexes?: Array<{
      IndexName: string
      KeySchema: Array<{ AttributeName: string; KeyType: 'HASH' | 'RANGE' }>
      Projection: { ProjectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE' }
    }>
    Tags?: Array<{ Key: string; Value: string }>
  }
}
