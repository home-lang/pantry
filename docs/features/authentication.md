# Authentication

pantry.dev supports user accounts with API token-based authentication for publishing packages. This guide covers how to sign up, create tokens, and use them.

## Overview

The pantry registry supports two authentication methods:

1. **User API Tokens** — Created through your pantry.dev account, prefixed with `ptry_`. Used for publishing packages from the CLI or CI.
2. **Legacy Admin Token** — A single shared token set via the `PANTRY_REGISTRY_TOKEN` environment variable. Used for backward compatibility with existing CI workflows.

## Getting Started

### 1. Create an Account

Visit [pantry.dev/signup](https://pantry.dev/signup) to create your account, or use the API directly:

```bash
curl -X POST https://registry.pantry.dev/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email": "you@example.com", "name": "Your Name", "password": "your-password"}'
```

### 2. Create an API Token

After logging in, visit [pantry.dev/account](https://pantry.dev/account) to create an API token. You can also create one via the API:

```bash
# First, log in to get a session
curl -X POST https://registry.pantry.dev/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "you@example.com", "password": "your-password"}' \
  -c cookies.txt

# Then create a token
curl -X POST https://registry.pantry.dev/auth/tokens \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"name": "CI deploy token", "permissions": ["publish", "read"]}'
```

The response includes the raw token (shown **only once**):

```json
{
  "success": true,
  "token": "ptry_a1b2c3d4e5f6...",
  "info": {
    "id": "ptry_a1b2c3d4e5f6...",
    "name": "CI deploy token",
    "permissions": ["publish", "read"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

Save this token securely. It cannot be retrieved again.

### 3. Publish a Package

Use your API token in the `Authorization` header:

```bash
# Using pantry CLI
PANTRY_TOKEN=ptry_a1b2c3d4... pantry publish --npm --access public

# Using curl directly
curl -X POST https://registry.pantry.dev/publish \
  -H 'Authorization: Bearer ptry_a1b2c3d4...' \
  -F 'metadata={"name":"my-package","version":"1.0.0"}' \
  -F 'tarball=@my-package-1.0.0.tgz'
```

## Token Permissions

Tokens can have the following permissions:

| Permission | Description |
|-----------|-------------|
| `publish` | Publish new package versions |
| `read` | Read package metadata and download tarballs (for paywalled packages) |

By default, new tokens receive both `publish` and `read` permissions.

## Token Expiration

Tokens can optionally have an expiration date. Available options when creating a token:

- **No expiration** (default)
- **30 days**
- **90 days**
- **1 year**
- **Custom** (via `expiresInDays` API parameter)

Expired tokens are automatically rejected.

## Managing Tokens

### List Tokens

```bash
curl https://registry.pantry.dev/auth/tokens -b cookies.txt
```

### Revoke a Token

```bash
curl -X DELETE https://registry.pantry.dev/auth/tokens/ptry_a1b2c3d4... -b cookies.txt
```

Revoked tokens are immediately invalidated.

## Security

### Password Storage

Passwords are hashed using **Argon2id** (via Bun.password), the recommended algorithm for password hashing. Raw passwords are never stored.

### Token Storage

API tokens are stored as **SHA-256 hashes**. The raw token is returned only once at creation time. Even if the database is compromised, tokens cannot be extracted.

### Session Management

Web sessions use HTTP-only cookies with the following attributes:
- `HttpOnly` — Not accessible via JavaScript
- `SameSite=Lax` — CSRF protection
- 30-day expiration
- Sessions can be destroyed by logging out

## API Reference

### Authentication Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/auth/signup` | Create a new account | No |
| `POST` | `/auth/login` | Log in and get session | No |
| `POST` | `/auth/logout` | Destroy session | Session cookie |
| `GET` | `/auth/me` | Get current user info | Session cookie |
| `GET` | `/auth/tokens` | List API tokens | Session cookie |
| `POST` | `/auth/tokens` | Create API token | Session cookie |
| `DELETE` | `/auth/tokens/:id` | Revoke API token | Session cookie |

### Web Pages

| Path | Description |
|------|-------------|
| `/signup` | Registration form |
| `/login` | Login form |
| `/account` | Token management dashboard |

### Request/Response Examples

#### Signup

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "you@example.com",
  "name": "Your Name",
  "password": "secure-password-123"
}
```

```http
HTTP/1.1 201 Created
Set-Cookie: pantry_session=<token>; Path=/; HttpOnly; SameSite=Lax

{
  "success": true,
  "user": {
    "email": "you@example.com",
    "name": "Your Name",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "secure-password-123"
}
```

```http
HTTP/1.1 200 OK
Set-Cookie: pantry_session=<token>; Path=/; HttpOnly; SameSite=Lax

{
  "success": true,
  "user": {
    "email": "you@example.com",
    "name": "Your Name"
  }
}
```

#### Create Token

```http
POST /auth/tokens
Cookie: pantry_session=<session>
Content-Type: application/json

{
  "name": "CI Token",
  "permissions": ["publish", "read"],
  "expiresInDays": 90
}
```

```http
HTTP/1.1 201 Created

{
  "success": true,
  "token": "ptry_<raw-token>",
  "info": {
    "id": "ptry_a1b2c3d4e5f6...",
    "name": "CI Token",
    "permissions": ["publish", "read"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "expiresAt": "2024-04-15T10:30:00.000Z"
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PANTRY_REGISTRY_TOKEN` | Legacy admin token for CI | `ABCD1234` |
| `PANTRY_TOKEN` | Alias for `PANTRY_REGISTRY_TOKEN` | — |
| `DYNAMODB_TABLE` | DynamoDB table (auth uses same table as packages) | `local` |

## CI/CD Integration

### GitHub Actions

```yaml
- name: Publish to pantry
  env:
    PANTRY_TOKEN: ${{ secrets.PANTRY_API_TOKEN }}
  run: pantry publish --npm --access public
```

### Environment Variables

Store your `ptry_` token as a secret in your CI provider:

- **GitHub**: Repository Settings > Secrets > `PANTRY_API_TOKEN`
- **GitLab**: Settings > CI/CD > Variables > `PANTRY_API_TOKEN`
- **Buildkite**: Pipeline Settings > Environment Variables

## Migration from Legacy Token

If you're currently using `PANTRY_REGISTRY_TOKEN` for publishing:

1. Create an account at [pantry.dev/signup](https://pantry.dev/signup)
2. Create a personal API token at [pantry.dev/account](https://pantry.dev/account)
3. Replace `PANTRY_REGISTRY_TOKEN` with your new `ptry_` token in CI secrets
4. The legacy token continues to work — no rush to migrate
