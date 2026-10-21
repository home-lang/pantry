# ts-pantry

TypeScript types for Pantry package manager configuration with **full type validation** for package names and versions.

## Installation

```bash
bun add -d ts-pantry
```

## Usage

```typescript
import type { PantryConfig } from 'ts-pantry'

export const config: PantryConfig = {
  dependencies: {
    'bun.com': '^1.3.0',      // ✅ Valid
    'sqlite.org': '^3.47.2',  // ✅ Valid
    // 'bun.com': '^999.999.999',  // ❌ TypeScript error: invalid version!
    // 'fake-pkg': 'latest',      // ❌ TypeScript error: package doesn't exist!
  },

  services: {
    enabled: true,
    autoStart: true,
    database: {
      connection: 'sqlite',
      name: 'myapp',
    },
  },

  verbose: true,
}

export default config
```

## Features

- **Full Type Validation**: Package names and versions are validated at compile time
- **IntelliSense Support**: Get autocomplete for all 3000+ packages from the pkgx registry
- **Version Validation**: Invalid versions trigger TypeScript errors
- **Zero Configuration**: Just import and use - no additional setup required
- **App Store Automation**: Provision macOS identifiers, capabilities, certificates,
  and profiles, then manage App Store versions and processed builds

## App Store Connect

Pantry owns the provider-neutral Apple distribution layer used by release actions
and framework integrations. Authentication defaults to
`APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_API_ISSUER_ID`, and
`APP_STORE_CONNECT_API_KEY_PATH`.

Provisioning is plan-only unless `checkOnly: false` is explicitly passed. It
reuses active certificates and profiles and never revokes existing resources.
Apple requires the initial app record to be created manually in App Store
Connect; Pantry reports that remaining action in its result.

```bash
# Generate the two private-key/CSR pairs locally.
ts-pantry app-store:csr --name "Example Desktop"

# Safe plan (no Apple resources are changed).
ts-pantry app-store:provision \
  --bundle-id com.example.desktop \
  --name "Example Desktop"

# Apply after supplying CSRs for any missing certificates.
ts-pantry app-store:provision \
  --bundle-id com.example.desktop \
  --name "Example Desktop" \
  --app-certificate-csr .pantry/apple/mac-app-distribution.csr \
  --installer-certificate-csr .pantry/apple/mac-installer-distribution.csr \
  --apply
```

```typescript
import {
  AppStoreConnectClient,
  ensureAppStoreVersions,
  provisionMacApp,
  waitForAppStoreBuilds,
} from 'ts-pantry'

const plan = await provisionMacApp({
  identifier: 'com.example.desktop',
  name: 'Example Desktop',
  capabilities: ['APP_GROUPS'],
})

const client = new AppStoreConnectClient()
const app = await client.findApp('com.example.desktop')
if (app) {
  const versions = await ensureAppStoreVersions(client, app.id, [
    { platform: 'MAC_OS', version: '1.0.0' },
  ])
  await waitForAppStoreBuilds(client, app.id, versions, '42')
}
```

## Type Definitions

### `PantryConfig`

Main configuration interface for Pantry with all available options.

### `Dependencies`

Type-safe dependency specification with version constraints.

### Helper Functions

- `definePantryConfig(config)` - Helper to define configuration with full type safety
- `defineDependencies(deps)` - Helper to define dependencies with type checking
- `definePackageList(packages)` - Helper to define package arrays

## License

MIT

### App Store submission

`AppStoreConnectClient`, `ensureAppStoreVersions`, and `waitForAppStoreBuilds`
manage Apple app versions and processed builds. `prepareAppStoreSubmission`
applies typed `AppStoreMetadata`: pricing, territories, categories, age rating,
localized descriptions, review contact and screenshots. Screenshot uploads use
Apple's reusable App Asset Library and discover eligible placement groups from
the current reference catalog. Supply `screenshots: [{ platform:
'MAC_APP_STORE', files: ['screenshots/main.png'] }]`; iPhone and iPad groups use
`IPHONE_APP_STORE` and `IPAD_APP_STORE`. Legacy screenshot display-type keys
remain accepted. Pass `submit: true` only
when the prepared version should enter App Review. `submitAppStore` prepares an
already-uploaded version by bundle ID and version, and preserves active review
submissions when a release command is retried. These APIs work for macOS and iOS
apps, independently of the application framework or an extension container.
