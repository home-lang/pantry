// Type declarations for @stacksjs/ts-cloud/aws
// The published package is missing src/ directory, only has dist/
declare module '@stacksjs/ts-cloud/aws' {
  export class S3Client {
    constructor(region?: string)
    getObject(bucket: string, key: string): Promise<string>
    putObject(options: {
      bucket: string
      key: string
      body: string | Buffer | Uint8Array
      contentType?: string
    }): Promise<void>
    listObjects(bucket: string, prefix?: string): Promise<string[]>
    deleteObject(bucket: string, key: string): Promise<void>
    headObject(bucket: string, key: string): Promise<{ contentLength?: number, lastModified?: Date }>
  }
}
