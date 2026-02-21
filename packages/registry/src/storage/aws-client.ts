/**
 * Lightweight AWS S3 client using direct API calls
 * Based on ts-cloud patterns - swap to ts-cloud when published
 */

import * as crypto from 'node:crypto'

interface AWSCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}

interface S3ListOptions {
  bucket: string
  prefix?: string
  maxKeys?: number
}

interface S3Object {
  Key: string
  LastModified?: string
  Size?: number
  ETag?: string
}

interface PutObjectOptions {
  bucket: string
  key: string
  body: Buffer | string
  contentType?: string
  acl?: string
  metadata?: Record<string, string>
}

/**
 * Lightweight S3 client using AWS Signature V4 authentication
 */
export class S3Client {
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

  private getHost(bucket: string): string {
    return `${bucket}.s3.${this.region}.amazonaws.com`
  }

  private sign(
    method: string,
    path: string,
    host: string,
    headers: Record<string, string>,
    payload: Buffer | string,
  ): Record<string, string> {
    const credentials = this.getCredentials()
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)

    const payloadHash = crypto.createHash('sha256')
      .update(typeof payload === 'string' ? payload : payload)
      .digest('hex')

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
      method,
      path,
      '', // query string
      canonicalHeaders,
      '',
      signedHeadersList,
      payloadHash,
    ].join('\n')

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`
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
      const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()
      return kSigning
    }

    const signingKey = getSignatureKey(credentials.secretAccessKey, dateStamp, this.region, 's3')
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    const authHeader = `${algorithm} Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`

    return {
      ...signedHeaders,
      'Authorization': authHeader,
    }
  }

  async putObject(options: PutObjectOptions): Promise<void> {
    const { bucket, key, body, contentType = 'application/octet-stream' } = options
    const host = this.getHost(bucket)
    const path = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`
    const payload = typeof body === 'string' ? Buffer.from(body) : body

    const headers = this.sign('PUT', path, host, {
      'content-type': contentType,
      'content-length': String(payload.length),
    }, payload)

    const response = await fetch(`https://${host}${path}`, {
      method: 'PUT',
      headers,
      body: new Uint8Array(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`S3 PUT failed: ${response.status} ${text}`)
    }
  }

  async getObjectBuffer(bucket: string, key: string): Promise<Buffer> {
    const host = this.getHost(bucket)
    const path = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`

    const headers = this.sign('GET', path, host, {}, '')

    const response = await fetch(`https://${host}${path}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`S3 GET failed: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async headObject(bucket: string, key: string): Promise<Record<string, string>> {
    const host = this.getHost(bucket)
    const path = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`

    const headers = this.sign('HEAD', path, host, {}, '')

    const response = await fetch(`https://${host}${path}`, {
      method: 'HEAD',
      headers,
    })

    if (!response.ok) {
      throw new Error(`S3 HEAD failed: ${response.status}`)
    }

    const result: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const host = this.getHost(bucket)
    const path = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`

    const headers = this.sign('DELETE', path, host, {}, '')

    const response = await fetch(`https://${host}${path}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`S3 DELETE failed: ${response.status}`)
    }
  }

  async list(options: S3ListOptions): Promise<S3Object[]> {
    const { bucket, prefix = '', maxKeys = 1000 } = options
    const host = this.getHost(bucket)
    const queryParams = new URLSearchParams({
      'list-type': '2',
      'prefix': prefix,
      'max-keys': String(maxKeys),
    })
    const path = `/?${queryParams.toString()}`

    const headers = this.sign('GET', '/', host, {}, '')

    const response = await fetch(`https://${host}${path}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`S3 LIST failed: ${response.status}`)
    }

    const text = await response.text()
    const objects: S3Object[] = []

    // Simple XML parsing for Contents elements
    const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g
    let match
    while ((match = contentsRegex.exec(text)) !== null) {
      const content = match[1]
      const keyMatch = content.match(/<Key>([^<]+)<\/Key>/)
      const lastModifiedMatch = content.match(/<LastModified>([^<]+)<\/LastModified>/)
      const sizeMatch = content.match(/<Size>([^<]+)<\/Size>/)
      const etagMatch = content.match(/<ETag>([^<]+)<\/ETag>/)

      if (keyMatch) {
        objects.push({
          Key: keyMatch[1],
          LastModified: lastModifiedMatch?.[1],
          Size: sizeMatch ? Number.parseInt(sizeMatch[1], 10) : undefined,
          ETag: etagMatch?.[1]?.replace(/"/g, ''),
        })
      }
    }

    return objects
  }

  generatePresignedGetUrl(bucket: string, key: string, expiresInSeconds = 3600): string {
    const credentials = this.getCredentials()
    const host = this.getHost(bucket)
    const path = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`

    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`

    const queryParams = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${credentials.accessKeyId}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expiresInSeconds),
      'X-Amz-SignedHeaders': 'host',
    })

    if (credentials.sessionToken) {
      queryParams.set('X-Amz-Security-Token', credentials.sessionToken)
    }

    const sortedParams = new URLSearchParams([...queryParams.entries()].sort())
    const canonicalQueryString = sortedParams.toString()

    const canonicalRequest = [
      'GET',
      path,
      canonicalQueryString,
      `host:${host}`,
      '',
      'host',
      'UNSIGNED-PAYLOAD',
    ].join('\n')

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n')

    const getSignatureKey = (key: string, dateStamp: string, region: string, service: string) => {
      const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest()
      const kRegion = crypto.createHmac('sha256', kDate).update(region).digest()
      const kService = crypto.createHmac('sha256', kRegion).update(service).digest()
      return crypto.createHmac('sha256', kService).update('aws4_request').digest()
    }

    const signingKey = getSignatureKey(credentials.secretAccessKey, dateStamp, this.region, 's3')
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    sortedParams.set('X-Amz-Signature', signature)
    return `https://${host}${path}?${sortedParams.toString()}`
  }

  generatePresignedPutUrl(bucket: string, key: string, contentType: string, expiresInSeconds = 3600): string {
    const credentials = this.getCredentials()
    const host = this.getHost(bucket)
    const path = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`

    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`

    const queryParams = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${credentials.accessKeyId}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expiresInSeconds),
      'X-Amz-SignedHeaders': 'content-type;host',
    })

    if (credentials.sessionToken) {
      queryParams.set('X-Amz-Security-Token', credentials.sessionToken)
    }

    const sortedParams = new URLSearchParams([...queryParams.entries()].sort())
    const canonicalQueryString = sortedParams.toString()

    const canonicalRequest = [
      'PUT',
      path,
      canonicalQueryString,
      `content-type:${contentType}`,
      `host:${host}`,
      '',
      'content-type;host',
      'UNSIGNED-PAYLOAD',
    ].join('\n')

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n')

    const getSignatureKey = (key: string, dateStamp: string, region: string, service: string) => {
      const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest()
      const kRegion = crypto.createHmac('sha256', kDate).update(region).digest()
      const kService = crypto.createHmac('sha256', kRegion).update(service).digest()
      return crypto.createHmac('sha256', kService).update('aws4_request').digest()
    }

    const signingKey = getSignatureKey(credentials.secretAccessKey, dateStamp, this.region, 's3')
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    sortedParams.set('X-Amz-Signature', signature)
    return `https://${host}${path}?${sortedParams.toString()}`
  }
}
