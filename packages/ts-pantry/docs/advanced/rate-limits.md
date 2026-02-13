# Working with GitHub API Rate Limits

ts-pkgx uses the GitHub API to fetch package information. This page covers advanced techniques for handling GitHub API rate limits effectively.

## Understanding GitHub API Rate Limits

GitHub imposes rate limits on API requests:
- Unauthenticated requests: 60 requests per hour
- Authenticated requests: 5,000 requests per hour

When you're fetching information for many packages, it's important to manage these limits carefully to avoid hitting the cap.

## Using GitHub Authentication

The most effective way to increase your rate limit is by using a GitHub token:

```bash
# Set the GITHUB_TOKEN environment variable
export GITHUB_TOKEN=your_github_personal_access_token

# Then run your fetch command
bun run pkgx:fetch --all
```

This increases your limit from 60 to 5,000 requests per hour, which is usually sufficient for most operations.

## Smart Caching

ts-pkgx implements built-in caching for API responses to avoid hitting rate limits:

```bash
# Use custom cache directory
bun run pkgx:fetch --all --cache-dir ./my-cache

# Set custom cache expiration (in minutes)
bun run pkgx:fetch --all --cache-expiration 120

# Disable caching if needed
bun run pkgx:fetch --all --no-cache
```

By default, cache entries expire after 24 hours (1440 minutes).

## Implementing Your Own Cache

You can implement custom caching logic in your own applications:

```typescript
import fs from 'node:fs'
import path from 'node:path'

interface GitHubCache {
  timestamp: number
  expiresAt: number
  data: any
}

// Save GitHub API response to cache
function saveGitHubCache(data: any, cacheDuration: number, cacheFile: string): void {
  try {
    const cacheData: GitHubCache = {
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheDuration,
      data,
    }
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2))
    console.log(`GitHub API cache saved to ${cacheFile}, expires at ${new Date(cacheData.expiresAt).toLocaleString()}`)
  }
  catch (error) {
    console.error('Failed to save GitHub cache:', error)
  }
}

// Load GitHub API response from cache if valid
function loadGitHubCache(cacheDuration: number, cacheFile: string): any | null {
  try {
    if (!fs.existsSync(cacheFile)) {
      return null
    }

    const cacheData: GitHubCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
    const now = Date.now()

    // Check if cache is still valid
    if (now - cacheData.timestamp <= cacheDuration) {
      console.log(`Using GitHub API cache from ${new Date(cacheData.timestamp).toLocaleString()}, expires at ${new Date(cacheData.expiresAt).toLocaleString()}`)
      return cacheData.data
    }
    else {
      console.log(`GitHub API cache expired (from ${new Date(cacheData.timestamp).toLocaleString()})`)
      return null
    }
  }
  catch (error) {
    console.error('Error loading GitHub cache:', error)
    return null
  }
}
```

## Batch Processing with Rate Limiting

When processing large numbers of packages, use batch processing with concurrency control:

```bash
# Limit concurrency to avoid rate limit issues
bun run pkgx:fetch --all --concurrency 5
```

The lower concurrency means fewer simultaneous API requests, reducing the chance of hitting rate limits.

## Rate Limit Monitoring

You can implement monitoring to track your API usage:

```typescript
interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: Date
  tokenPrefix?: string
}

async function checkRateLimitStatus(token?: string): Promise<RateLimitInfo> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ts-pkgx'
  }

  if (token) {
    headers.Authorization = `token ${token}`
  }

  const response = await fetch('https://api.github.com/rate_limit', { headers })

  if (!response.ok) {
    throw new Error(`Failed to check rate limit: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    resetTime: new Date(data.rate.reset * 1000),
    tokenPrefix: token ? `${token.substring(0, 4)}...` : undefined
  }
}
```

## Adaptive Fetching

Implement adaptive fetching that adjusts based on your current rate limit status:

```typescript
async function fetchWithRateLimitAwareness(
  fetchFn: () => Promise<any>,
  token?: string
): Promise<any> {
  // Check current rate limit
  const status = await checkRateLimitStatus(token)

  // If we're getting low, apply throttling or delay
  if (status.remaining < 10) {
    const resetTime = status.resetTime.getTime()
    const now = Date.now()
    const waitTime = Math.max(0, resetTime - now + 1000) // Add 1 second margin

    console.warn(`Rate limit low (${status.remaining}/${status.limit}). Waiting ${waitTime / 1000} seconds until reset.`)

    // Wait until rate limit resets
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
      // Recheck limit after waiting
      return fetchWithRateLimitAwareness(fetchFn, token)
    }
  }

  // Proceed with the fetch
  return fetchFn()
}
```

## Best Practices

1. **Always use authentication** when fetching many packages
2. **Leverage caching** to avoid unnecessary API requests
3. **Control concurrency** to prevent overwhelming rate limits
4. **Monitor your usage** to identify potential issues early
5. **Implement adaptive fetching** that respects GitHub's rate limits
6. **Add delays** between batches to avoid hitting limits

By following these practices, you can effectively manage GitHub API rate limits while working with ts-pkgx, even when processing large numbers of packages.
