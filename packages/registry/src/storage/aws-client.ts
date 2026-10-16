/**
 * Lightweight S3-compatible client using direct API calls + AWS Signature V4.
 *
 * Drives AWS S3, Backblaze B2 and Hetzner Object Storage — all three speak the
 * S3 API with SigV4, differing only in endpoint host, addressing style and
 * where credentials come from. Pass `endpoint`/`forcePathStyle` for the
 * S3-compatible providers; with neither set this behaves exactly like the
 * previous AWS-only client.
 *
 * Mirrors ts-cloud's S3Client — swap to `@stacksjs/ts-cloud/aws` once the
 * multi-provider release is fully published on npm.
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

export interface S3ClientOptions {
  /** Endpoint host override (no scheme) for S3-compatible providers, e.g. `s3.us-west-004.backblazeb2.com`. */
  endpoint?: string
  /** Force path-style addressing instead of virtual-hosted. Defaults to virtual-hosted. */
  forcePathStyle?: boolean
  /** Explicit credentials; when set they win over the env-based resolution. */
  credentials?: AWSCredentials
}

/**
 * Lightweight S3 client using AWS Signature V4 authentication
 */
export class S3Client {
  private region: string
  private endpoint?: string
  private forcePathStyle: boolean
  private explicitCredentials?: AWSCredentials
  private cachedCredentials: AWSCredentials | null = null

  constructor(region = 'us-east-1', options: S3ClientOptions = {}) {
    this.region = region
    this.endpoint = options.endpoint
    this.forcePathStyle = options.forcePathStyle ?? false
    this.explicitCredentials = options.credentials
  }

  private getCredentials(): AWSCredentials {
    if (this.cachedCredentials)
      return this.cachedCredentials

    if (this.explicitCredentials?.accessKeyId && this.explicitCredentials.secretAccessKey) {
      this.cachedCredentials = this.explicitCredentials
      return this.cachedCredentials
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const sessionToken = process.env.AWS_SESSION_TOKEN

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('S3 credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or pass explicit credentials).')
    }

    this.cachedCredentials = { accessKeyId, secretAccessKey, sessionToken }
    return this.cachedCredentials
  }

  /** Base endpoint host (no bucket): provider endpoint or AWS default. */
  private baseHost(): string {
    return this.endpoint || `s3.${this.region}.amazonaws.com`
  }

  /** Request host for a bucket — virtual-hosted by default, bare base host in path-style mode. */
  private getHost(bucket: string): string {
    return this.forcePathStyle ? this.baseHost() : `${bucket}.${this.baseHost()}`
  }

  /** Request path for an object key, prefixing the bucket in path-style mode. */
  private objectPath(bucket: string, key: string): string {
    const encoded = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`
    return this.forcePathStyle ? `/${bucket}${encoded}` : encoded
  }

  /** Request path for a bucket-scoped query (e.g. list), prefixing the bucket in path-style mode. */
  private bucketQueryPath(bucket: string, query: string): string {
    return this.forcePathStyle ? `/${bucket}${query}` : query
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
      .update(payload)
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

    // Create canonical request — split path and query string for proper signing
    const [canonicalPath, queryString] = path.includes('?') ? path.split('?', 2) : [path, '']
    // Sort query params alphabetically (required by AWS V4 signing)
    const sortedQueryString = queryString
      ? queryString.split('&').sort().join('&')
      : ''

    const sortedHeaderKeys = Object.keys(signedHeaders).sort()
    const canonicalHeaders = sortedHeaderKeys
      .map(k => `${k.toLowerCase()}:${signedHeaders[k].trim()}`)
      .join('\n')
    const signedHeadersList = sortedHeaderKeys.map(k => k.toLowerCase()).join(';')

    const canonicalRequest = [
      method,
      canonicalPath,
      sortedQueryString,
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
    const path = this.objectPath(bucket, key)
    const payload = typeof body === 'string' ? Buffer.from(body) : body

    await this.writeObject('PUT', host, path, {
      'content-type': contentType,
      'content-length': String(payload.length),
    }, payload)
  }

  /** PUT and CopyObject are idempotent: retry the same bytes at the same key. */
  private async writeObject(
    operation: 'PUT' | 'COPY',
    host: string,
    path: string,
    headers: Record<string, string>,
    payload: Buffer | null,
  ): Promise<void> {
    const attempts = 4
    for (let attempt = 0; attempt < attempts; attempt++) {
      let response: Response
      try {
        // Re-sign each attempt rather than reusing a potentially expired date.
        response = await fetch(`https://${host}${path}`, {
          method: 'PUT',
          headers: this.sign('PUT', path, host, headers, payload ?? ''),
          body: payload === null ? undefined : new Uint8Array(payload),
          signal: AbortSignal.timeout(15_000),
        })
      }
      catch (error) {
        const transportError = error instanceof TypeError
          || (error instanceof DOMException && error.name === 'TimeoutError')
        if (!transportError || attempt === attempts - 1) throw error
        await Bun.sleep(Math.random() * 250 * 2 ** attempt)
        continue
      }
      if (response.ok) return
      const retryable = [408, 429, 500, 502, 503, 504].includes(response.status)
      if (!retryable || attempt === attempts - 1) {
        const text = await response.text().catch(() => '')
        throw new Error(`S3 ${operation} failed: ${response.status} ${text}`)
      }
      // Release the failed response before resending a potentially large body.
      await response.body?.cancel()
      const retryAfter = response.headers.get('retry-after')
      const seconds = retryAfter === null ? NaN : Number(retryAfter)
      const requestedDelay = Number.isFinite(seconds)
        ? seconds * 1000
        : Date.parse(retryAfter ?? '') - Date.now()
      const delay = Number.isFinite(requestedDelay)
        ? Math.min(5000, Math.max(0, requestedDelay))
        : Math.random() * 250 * 2 ** attempt
      await Bun.sleep(delay)
    }
  }

  async getObjectBuffer(bucket: string, key: string): Promise<Buffer> {
    const host = this.getHost(bucket)
    const path = this.objectPath(bucket, key)

    const headers = this.sign('GET', path, host, {}, '')

    const response = await fetch(`https://${host}${path}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`S3 GET failed: ${response.status} ${text}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async getObjectStream(
    bucket: string,
    key: string,
  ): Promise<{ body: ReadableStream<Uint8Array>, contentLength?: number }> {
    const host = this.getHost(bucket)
    const path = this.objectPath(bucket, key)
    const headers = this.sign('GET', path, host, {}, '')
    const response = await fetch(`https://${host}${path}`, { method: 'GET', headers })
    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '')
      throw new Error(`S3 GET failed: ${response.status} ${text}`)
    }
    const rawLength = response.headers.get('content-length')
    const contentLength = rawLength ? Number.parseInt(rawLength, 10) : undefined
    return {
      body: response.body,
      contentLength: Number.isSafeInteger(contentLength) ? contentLength : undefined,
    }
  }

  async headObject(bucket: string, key: string): Promise<Record<string, string>> {
    const host = this.getHost(bucket)
    const path = this.objectPath(bucket, key)

    const headers = this.sign('HEAD', path, host, {}, '')

    const response = await fetch(`https://${host}${path}`, {
      method: 'HEAD',
      headers,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`S3 HEAD failed: ${response.status} ${text}`)
    }

    const result: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const host = this.getHost(bucket)
    const path = this.objectPath(bucket, key)

    const headers = this.sign('DELETE', path, host, {}, '')

    const response = await fetch(`https://${host}${path}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok && response.status !== 404) {
      const text = await response.text().catch(() => '')
      throw new Error(`S3 DELETE failed: ${response.status} ${text}`)
    }
  }

  /**
   * Promote an object without downloading and re-uploading it. S3-compatible
   * providers implement CopyObject as a signed PUT with x-amz-copy-source.
   */
  async copyObject(bucket: string, sourceKey: string, destinationKey: string): Promise<void> {
    const host = this.getHost(bucket)
    const path = this.objectPath(bucket, destinationKey)
    const encodedSource = `/${bucket}/${encodeURIComponent(sourceKey).replace(/%2F/g, '/')}`
    await this.writeObject('COPY', host, path, {
      'content-length': '0',
      'x-amz-copy-source': encodedSource,
    }, null)
  }

  async list(options: S3ListOptions): Promise<S3Object[]> {
    const { bucket, prefix = '', maxKeys = 1000 } = options
    const host = this.getHost(bucket)
    const results: S3Object[] = []
    let continuationToken: string | undefined
    // Follow pagination until `maxKeys` results are collected or the server
    // reports there are no more pages. Previously we returned only the first
    // response which silently truncated callers (e.g. short-SHA lookup).
    const pageSize = Math.min(maxKeys, 1000)

    while (results.length < maxKeys) {
      const params: Record<string, string> = {
        'list-type': '2',
        'max-keys': String(Math.min(pageSize, maxKeys - results.length)),
        'prefix': prefix,
      }
      if (continuationToken) params['continuation-token'] = continuationToken
      const queryParams = new URLSearchParams(params)
      const path = this.bucketQueryPath(bucket, `/?${queryParams.toString()}`)
      const headers = this.sign('GET', path, host, {}, '')

      const response = await fetch(`https://${host}${path}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`S3 LIST failed: ${response.status}`)
      }

      const text = await response.text()

      const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g
      let match: RegExpExecArray | null
      while ((match = contentsRegex.exec(text)) !== null) {
        const content = match[1]
        const keyMatch = content.match(/<Key>([^<]+)<\/Key>/)
        const lastModifiedMatch = content.match(/<LastModified>([^<]+)<\/LastModified>/)
        const sizeMatch = content.match(/<Size>([^<]+)<\/Size>/)
        const etagMatch = content.match(/<ETag>([^<]+)<\/ETag>/)

        if (keyMatch) {
          results.push({
            Key: keyMatch[1],
            LastModified: lastModifiedMatch?.[1],
            Size: sizeMatch ? Number.parseInt(sizeMatch[1], 10) : undefined,
            ETag: etagMatch?.[1]?.replace(/"/g, ''),
          })
        }
      }

      const isTruncated = /<IsTruncated>true<\/IsTruncated>/.test(text)
      const tokenMatch = text.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)
      if (!isTruncated || !tokenMatch) break
      continuationToken = tokenMatch[1]
    }

    return results
  }

  /**
   * `signedAt` pins the signing instant. Left unset every call produces a
   * different URL, which is correct but makes the result uncacheable by
   * anything downstream. Callers that hand the same object to many clients can
   * pass a rounded timestamp so everyone inside that window gets a
   * byte-identical URL a shared cache can reuse.
   */
  generatePresignedGetUrl(bucket: string, key: string, expiresInSeconds = 900, signedAt?: Date): string {
    return this.generatePresignedUrl('GET', bucket, key, expiresInSeconds, undefined, signedAt)
  }

  generatePresignedPutUrl(bucket: string, key: string, contentType?: string, expiresInSeconds = 900): string {
    return this.generatePresignedUrl('PUT', bucket, key, expiresInSeconds, contentType)
  }

  private generatePresignedUrl(method: 'GET' | 'PUT', bucket: string, key: string, expiresInSeconds: number, contentType?: string, signedAt?: Date): string {
    const credentials = this.getCredentials()
    const host = this.getHost(bucket)
    const path = this.objectPath(bucket, key)

    const now = signedAt ?? new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`

    const isPut = method === 'PUT'
    const signedHeaderList = isPut ? 'content-type;host' : 'host'

    const queryParams = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${credentials.accessKeyId}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expiresInSeconds),
      'X-Amz-SignedHeaders': signedHeaderList,
    })

    if (credentials.sessionToken) {
      queryParams.set('X-Amz-Security-Token', credentials.sessionToken)
    }

    const sortedParams = new URLSearchParams([...queryParams.entries()].sort())
    const canonicalQueryString = sortedParams.toString()

    const canonicalHeaders = isPut
      ? `content-type:${contentType}\nhost:${host}`
      : `host:${host}`

    const canonicalRequest = [
      method,
      path,
      canonicalQueryString,
      canonicalHeaders,
      '',
      signedHeaderList,
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
