# Backblaze B2 Object Storage

The registry's object storage (package tarballs, pre-built binaries, and the
package metadata index) can run on **Backblaze B2** instead of AWS S3 to cut
cost. B2 is S3-compatible, so the same code drives it — only the endpoint,
addressing and credentials change. Hetzner Object Storage is supported the same
way (set `STORAGE_PROVIDER=hetzner`).

The registry **server still runs on EC2**; only storage moves to B2. Metadata
moves from DynamoDB to an object in the B2 bucket (`metadata/registry-index.json`),
so the registry no longer needs DynamoDB.

## What you need to create in Backblaze

1. Create a [Backblaze](https://www.backblaze.com/) account and enable **B2 Cloud Storage**.
2. **Create a bucket** (e.g. `pantry-registry`). Keep it **Private** — the registry
   server proxies downloads (`registry.pantry.dev/binaries/...`), so the bucket
   does not need public access.
3. Note the bucket's **Endpoint**, shown as `s3.<region>.backblazeb2.com`
   (e.g. `s3.us-west-004.backblazeb2.com`). The `<region>` part (e.g. `us-west-004`)
   is your `S3_REGION`.
4. Go to **App Keys → Add a New Application Key**:
   - Scope it to the bucket above, **Read and Write**.
   - Copy the **keyID** and **applicationKey** (the secret is shown only once).
   - Do **not** use the master application key — it cannot be used with the S3 API.

## Values to fill

### GitHub repo settings (for the binary build/sync workflows)

`build.yml` and `sync-binaries.yml` read these. Set on `home-lang/pantry`:

| Kind | Name | Value | How to get it |
|------|------|-------|---------------|
| Variable | `STORAGE_PROVIDER` | `backblaze` | — |
| Variable | `S3_BUCKET` | your bucket name, e.g. `pantry-registry` | from step 2 |
| Variable | `S3_REGION` | e.g. `us-west-004` | from the bucket endpoint (step 3) |
| Variable | `S3_ENDPOINT` | *(optional)* `s3.us-west-004.backblazeb2.com` | auto-derived from region if unset |
| Secret | `B2_APPLICATION_KEY_ID` | the keyID | from step 4 |
| Secret | `B2_APPLICATION_KEY` | the applicationKey | from step 4 |

```bash
# Variables
gh variable set STORAGE_PROVIDER --repo home-lang/pantry --body backblaze
gh variable set S3_BUCKET        --repo home-lang/pantry --body pantry-registry
gh variable set S3_REGION        --repo home-lang/pantry --body us-west-004
# Secrets
gh secret set B2_APPLICATION_KEY_ID --repo home-lang/pantry --body '<keyID>'
gh secret set B2_APPLICATION_KEY    --repo home-lang/pantry --body '<applicationKey>'
```

Leaving `STORAGE_PROVIDER` unset (or `aws`) keeps everything on S3 — the switch
is fully reversible.

### Registry server (EC2)

Point the running registry at B2 with the helper (writes the storage env into the
systemd unit, mirrors values into SSM, and restarts the service):

```bash
B2_BUCKET=pantry-registry \
B2_REGION=us-west-004 \
B2_APPLICATION_KEY_ID='<keyID>' \
B2_APPLICATION_KEY='<applicationKey>' \
./scripts/configure-registry-b2.sh
```

This sets, on the box:

```
STORAGE_PROVIDER=backblaze
S3_BUCKET=pantry-registry
S3_REGION=us-west-004
S3_ENDPOINT=s3.us-west-004.backblazeb2.com
METADATA_BACKEND=object
B2_APPLICATION_KEY_ID=<keyID>
B2_APPLICATION_KEY=<applicationKey>
```

### Local development / `.env`

To run the registry locally against B2:

```bash
STORAGE_PROVIDER=backblaze
S3_BUCKET=pantry-registry
S3_REGION=us-west-004
B2_APPLICATION_KEY_ID=<keyID>
B2_APPLICATION_KEY=<applicationKey>
# METADATA_BACKEND=object is the default for non-AWS providers; set explicitly if desired.
```

## Environment variable reference

Resolved by `packages/registry/src/storage/provider.ts` and ts-cloud's
`createObjectStorageClient`:

| Var | Purpose |
|-----|---------|
| `STORAGE_PROVIDER` | `aws` \| `backblaze` \| `hetzner` (default `aws`) |
| `S3_BUCKET` | bucket name |
| `S3_REGION` | region/location slug (B2: `us-west-004`, Hetzner: `fsn1`) |
| `S3_ENDPOINT` | endpoint host override; auto-derived per provider+region if unset |
| `S3_FORCE_PATH_STYLE` | `true` to force path-style addressing (default virtual-hosted) |
| `METADATA_BACKEND` | `object` \| `dynamodb` \| `file` (default: `object` for non-AWS) |
| `B2_APPLICATION_KEY_ID` / `B2_APPLICATION_KEY` | Backblaze credentials |
| `HETZNER_S3_ACCESS_KEY` / `HETZNER_S3_SECRET_KEY` | Hetzner credentials |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | generic fallback credentials |

## Repopulating B2

Once the variables/secrets are set, repopulate the bucket from CI:

```bash
# Re-sync pre-built binaries (fast; pulls from upstream into B2)
gh workflow run sync-binaries.yml --repo home-lang/pantry
# Rebuild source packages as needed
gh workflow run build.yml --repo home-lang/pantry
```

Watch with `gh run watch <id>`. After B2 is populated and the server is pointed
at it (and verified via `curl -fsS https://registry.pantry.dev/health` plus a
real install), the old S3 bucket / DynamoDB table can be retired.

## Hetzner (alternative)

Same flow with `STORAGE_PROVIDER=hetzner`, `S3_REGION=fsn1|nbg1|hel1`, and
credentials from the Hetzner Cloud Console → Object Storage
(`HETZNER_S3_ACCESS_KEY` / `HETZNER_S3_SECRET_KEY`). Endpoint auto-derives to
`<region>.your-objectstorage.com`.
