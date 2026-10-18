/**
 * **dynamodb-local** - Amazon DynamoDB Local for development and integration tests
 *
 * @domain `aws.amazon.com/dynamodb-local`
 * @programs `dynamodb-local`
 * @version `3.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install aws.amazon.com/dynamodb-local`
 * @name `dynamodb-local`
 * @homepage https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html
 * @dependencies `openjdk.org>=17`
 * @buildDependencies `maven.apache.org^3`, `bun.com>=1.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access the package
 * const pkg = pantry.dynamodblocal
 * // Or access via domain
 * const samePkg = pantry.awsamazoncomdynamodblocal
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "dynamodb-local"
 * console.log(pkg.description) // "Amazon DynamoDB Local for development and integ..."
 * console.log(pkg.programs)    // ["dynamodb-local"]
 * console.log(pkg.versions[0]) // "3.3.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/aws-amazon-com/dynamodb-local.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const dynamodblocalPackage = {
  /**
  * The display name of this package.
  */
  name: 'dynamodb-local' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'aws.amazon.com/dynamodb-local' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Amazon DynamoDB Local for development and integration tests' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install aws.amazon.com/dynamodb-local' as const,
  pantryInstallCommand: 'pantry install aws.amazon.com/dynamodb-local' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dynamodb-local',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openjdk.org>=17',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'maven.apache.org^3',
    'bun.com>=1.3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.3.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type DynamodblocalPackage = typeof dynamodblocalPackage
