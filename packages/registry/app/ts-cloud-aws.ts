// Stub types for ts-cloud/aws compatibility
// These types match the ts-cloud wrapper API

export interface AttributeValue {
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

export interface GetItemInput {
  TableName: string
  Key: Record<string, AttributeValue>
}

export interface GetItemOutput {
  Item?: Record<string, AttributeValue>
}

export interface PutItemInput {
  TableName: string
  Item: Record<string, AttributeValue>
  ConditionExpression?: string
}

export interface QueryInput {
  TableName: string
  IndexName?: string
  KeyConditionExpression?: string
  FilterExpression?: string
  ExpressionAttributeNames?: Record<string, string>
  ExpressionAttributeValues?: Record<string, AttributeValue>
  ProjectionExpression?: string
  Limit?: number
  ScanIndexForward?: boolean
  ExclusiveStartKey?: Record<string, AttributeValue>
}

export interface QueryOutput {
  Items?: Record<string, AttributeValue>[]
  Count?: number
  ScannedCount?: number
  LastEvaluatedKey?: Record<string, AttributeValue>
}

export interface ScanInput {
  TableName: string
  FilterExpression?: string
  ExpressionAttributeNames?: Record<string, string>
  ExpressionAttributeValues?: Record<string, AttributeValue>
  ProjectionExpression?: string
  Limit?: number
  ExclusiveStartKey?: Record<string, AttributeValue>
}

export interface ScanOutput {
  Items?: Record<string, AttributeValue>[]
  Count?: number
  ScannedCount?: number
  LastEvaluatedKey?: Record<string, AttributeValue>
}

export interface DeleteItemInput {
  TableName: string
  Key: Record<string, AttributeValue>
}

export interface ListTablesOutput {
  TableNames?: string[]
}

export interface DescribeTableInput {
  TableName: string
}

export interface DescribeTableOutput {
  Table?: {
    TableName?: string
    TableStatus?: string
    ItemCount?: number
  }
}

export interface CreateTableInput {
  TableName: string
  KeySchema: Array<{ AttributeName: string; KeyType: string }>
  AttributeDefinitions: Array<{ AttributeName: string; AttributeType: string }>
  BillingMode?: string
  GlobalSecondaryIndexes?: Array<{
    IndexName: string
    KeySchema: Array<{ AttributeName: string; KeyType: string }>
    Projection: { ProjectionType: string }
  }>
  Tags?: Array<{ Key: string; Value: string }>
}

export class DynamoDBClient {
  constructor(region?: string) {}

  async getItem(input: GetItemInput): Promise<GetItemOutput> {
    return {}
  }

  async putItem(input: PutItemInput): Promise<void> {}

  async query(input: QueryInput): Promise<QueryOutput> {
    return {}
  }

  async scan(input: ScanInput): Promise<ScanOutput> {
    return {}
  }

  async deleteItem(input: DeleteItemInput): Promise<void> {}

  async listTables(input?: Record<string, unknown>): Promise<ListTablesOutput> {
    return {}
  }

  async describeTable(input: DescribeTableInput): Promise<DescribeTableOutput> {
    return {}
  }

  async createTable(input: CreateTableInput): Promise<void> {}

  static unmarshal<T = Record<string, unknown>>(item: Record<string, AttributeValue>): T {
    return {} as T
  }

  static marshal(item: Record<string, unknown>): Record<string, AttributeValue> {
    return {}
  }
}

// ts-cloud uses lowercase property names
export interface PutObjectInput {
  bucket: string
  key: string
  body: string | Uint8Array | Buffer | ReadableStream
  contentType?: string
  metadata?: Record<string, string>
}

export interface ListObjectsInput {
  bucket: string
  prefix?: string
  maxKeys?: number
}

export interface S3Object {
  Key?: string
  Size?: number
  LastModified?: Date
}

export class S3Client {
  constructor(region?: string) {}

  async putObject(input: PutObjectInput): Promise<void> {}

  async getObject(bucket: string, key: string): Promise<string> {
    return ''
  }

  async deleteObject(bucket: string, key: string): Promise<void> {}

  async list(input: ListObjectsInput): Promise<S3Object[]> {
    return []
  }

  async bucketExists(bucket: string): Promise<boolean> {
    return false
  }

  async createBucket(bucket: string): Promise<void> {}
}

export function getSignedUrl(
  client: S3Client,
  command: unknown,
  options?: { expiresIn?: number }
): Promise<string> {
  return Promise.resolve('')
}
