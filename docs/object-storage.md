# Object Storage (Hetzner / Backblaze / S3 / R2)

The registry's object storage — package tarballs, pre-built binaries, and the
package metadata index — runs on any **S3-compatible** provider. **Hetzner Object
Storage** is the recommended low-cost target; Backblaze B2 and AWS S3 work
identically (only endpoint, addressing and credentials differ).

The registry server can stay on Hetzner or another compute host when storage
moves. Metadata moves
from AWS DynamoDB to a JSON object in the bucket (`metadata/registry-index.json`,
`ObjectMetadataStorage`), so the registry no longer needs DynamoDB.

## Hetzner: what to create

1. In the [Hetzner Cloud Console](https://console.hetzner.cloud/), open your
   project → **Object Storage**.
2. **Create a bucket** (e.g. `pantry-registry`) in a location: `fsn1`
   (Falkenstein), `nbg1` (Nuremberg) or `hel1` (Helsinki). That location is your
   `S3_REGION`; the endpoint is `<location>.your-objectstorage.com`
   (e.g. `fsn1.your-objectstorage.com`).
3. Generate **S3 credentials** for the bucket (access key + secret key). Keep the
   bucket **private** — the registry authorizes binary downloads and redirects
   clients to signed object URLs, so public access isn't required.

That gives you four values: bucket name, region, access key, secret key.

## Values to set

### GitHub repo settings (binary build/sync workflows)

`build.yml` and `sync-binaries.yml` read these. Set on `pantry-pm/pantry`:

| Kind | Name | Value (Hetzner example) |
|------|------|--------------------------|
| Variable | `STORAGE_PROVIDER` | `hetzner` |
| Variable | `S3_BUCKET` | `pantry-registry` |
| Variable | `S3_REGION` | `fsn1` |
| Variable | `S3_ENDPOINT` | *(optional)* `fsn1.your-objectstorage.com` (auto-derived if unset) |
| Secret | `S3_ACCESS_KEY_ID` | your Hetzner access key |
| Secret | `S3_SECRET_ACCESS_KEY` | your Hetzner secret key |

```bash
gh variable set STORAGE_PROVIDER --repo pantry-pm/pantry --body hetzner
gh variable set S3_BUCKET        --repo pantry-pm/pantry --body pantry-registry
gh variable set S3_REGION        --repo pantry-pm/pantry --body fsn1
gh secret   set S3_ACCESS_KEY_ID     --repo pantry-pm/pantry --body '<access-key>'
gh secret   set S3_SECRET_ACCESS_KEY --repo pantry-pm/pantry --body '<secret-key>'
```

Leaving `STORAGE_PROVIDER` unset (or `aws`) keeps everything on S3 — fully reversible.

### Registry server

Point a running registry at the provider. The script writes the storage
configuration into the service's environment file, restarts it, and waits for
`/health`:

```bash
PANTRY_REGISTRY_HOST=registry.example.com \
STORAGE_PROVIDER=hetzner \
S3_BUCKET=my-registry \
S3_REGION=fsn1 \
S3_ACCESS_KEY_ID='<access-key>' \
S3_SECRET_ACCESS_KEY='<secret-key>' \
pantry registry storage
```

Set `PANTRY_REGISTRY_SSH_KEY` if the host needs a specific identity file, and
`PANTRY_SSM_MIRROR=1` to also mirror the values into AWS SSM. Running your own
registry from a fork is covered in [self-hosting](self-hosting.md).

### Local development / `.env`

```bash
STORAGE_PROVIDER=hetzner
S3_BUCKET=pantry-registry
S3_REGION=fsn1
S3_ACCESS_KEY_ID=<access-key>
S3_SECRET_ACCESS_KEY=<secret-key>
# METADATA_BACKEND=object is the default for non-AWS providers.
```

## Environment variable reference

Resolved by `packages/registry/src/storage/provider.ts` and ts-cloud's
`createObjectStorageClient`:

| Var | Purpose |
|-----|---------|
| `STORAGE_PROVIDER` | `aws` \| `hetzner` \| `backblaze` (default `aws`) |
| `S3_BUCKET` | bucket name |
| `S3_REGION` | region/location slug (Hetzner: `fsn1`; Backblaze: `us-west-004`) |
| `S3_ENDPOINT` | endpoint host override; auto-derived per provider+region if unset |
| `S3_FORCE_PATH_STYLE` | `true` to force path-style (default virtual-hosted) |
| `METADATA_BACKEND` | `object` \| `dynamodb` \| `file` (default: `object` for non-AWS) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | credentials (works for any provider) |
| `HETZNER_S3_ACCESS_KEY` / `HETZNER_S3_SECRET_KEY` | Hetzner-specific (checked first if set) |
| `B2_APPLICATION_KEY_ID` / `B2_APPLICATION_KEY` | Backblaze-specific (checked first if set) |

## Traffic measurement and optimization

Hetzner bills external outgoing traffic. Uploads and internal transfers within
`eu-central` are free; S3 operations are also free. Object Storage has its own
account-wide allowance, separate from the VM allowance: about 1 TB/month,
accruing hourly (1.116 TB for a full 31-day month). Check the account's actual
invoice and all buckets before assigning an overrun to one application.
See [Hetzner billing](https://docs.hetzner.com/storage/object-storage/overview/).

`GET /api/egress` estimates authorized binary GET bytes, including package byte
rankings, observed dates, and a projection over the observed period. It excludes
HEAD probes. It cannot measure completed transfers, direct object URLs, scanner
reads, or CDN cache misses. Older retained history may include HEAD requests
counted as downloads. Use the provider's usage as the billing authority; do not
reset historical records to conceal that uncertainty.

Reduce transfers at their source:

- Cache native dependencies by platform and artifact digest in CI. CLI patch
  releases can reuse those bytes, with the current CLI reconciling the install.
- Install only Bun in download-only mirror and metadata jobs. Source build jobs
  retain their required toolchains.
- Use HEAD for probes; never fetch or materialize an archive to answer HEAD.
- Keep scans near storage in Hetzner's `eu-central` when practical. A GitHub
  runner downloading the same artifact is external traffic.
- Retain digest-bound scan reuse and incremental mirror sweeps. Avoid forced
  rebuilds of unchanged artifacts, and cache pinned versions across runs.

## Comparing R2 and Cloudflare

Keep compute on Hetzner and compare only the changing storage/delivery costs.
R2 Standard charges $0.015/GB-month after 10 GB, $4.50/million Class A operations
after 1 million, and $0.36/million Class B operations after 10 million, with
free egress. Operations round up to million-request billing units. Higher
storage prices can outweigh saved traffic charges for a large, lightly read
catalog. Infrequent Access adds retrieval fees, so it is not a substitute for
Standard in this comparison. Rates checked October 23, 2026:
[R2 pricing](https://developers.cloudflare.com/r2/pricing/).

For a 31-day month, Hetzner's published USD pricing is $7.99 base, plus
$0.0123 per excess TB-hour and $1.20 per excess external TB. Approximate costs
for constant billable storage `S` TB and external traffic `T` TB are:

```text
Hetzner = 7.99 + max(S - 1, 0) * 744 * 0.0123 + max(T - 1.116, 0) * 1.20
R2      = max(ceil(stored GB) - 10, 0) * 0.015 + billable operations
```

Use average usage across the billing period, not a point-in-time bucket size,
for an invoice estimate. Hetzner has a 64 kB minimum billable object size; R2's
storage metric averages daily peaks. All examples exclude VAT and compute.
[Hetzner pricing](https://www.hetzner.com/storage/object-storage/).

Cloudflare can front the website/API while artifacts go directly to R2.
Proxying R2 bytes through the Hetzner application would still consume host
egress. A public R2 custom domain enables CDN caching; `r2.dev` is for development.
Keep auth, staging, quarantine, and metadata snapshots private: an existing
registry bucket contains more than public binaries. Use a separate artifact
bucket or a restricted Worker endpoint, preserving scan and quarantine gates.
Workers Paid starts at $5/month plus overages if that design needs it.
[R2 access](https://developers.cloudflare.com/r2/buckets/public-buckets/),
[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

Do not assume Cloudflare's ordinary CDN is an unlimited binary mirror for
Hetzner: its terms restrict large-file delivery outside the appropriate services.
Free/Pro/Business caching also has a 512 MB object limit; larger R2 objects still
have free egress, but miss that cache. Large registry uploads need a direct
upload route or multipart strategy because the proxied upload limit starts at
100 MB.
[CDN terms](https://www.cloudflare.com/service-specific-terms-application-services/),
[cache and upload limits](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/).

## Repopulating the bucket

For an existing registry changing providers, copy its objects instead of
rebuilding the catalog. See the R2 cutover procedure below.

Once the variables/secrets are set, repopulate from CI:

```bash
gh workflow run sync-binaries.yml --repo pantry-pm/pantry   # re-sync pre-built binaries
gh workflow run build.yml         --repo pantry-pm/pantry   # rebuild source packages
```

Watch with `gh run watch <id>`. After the bucket is populated and the server is
pointed at it (verify `curl -fsS https://registry.pantry.dev/health` plus a real
`pantry install`), the old S3 bucket / DynamoDB table can be retired.

## Backblaze B2 (alternative)

Same flow with `STORAGE_PROVIDER=backblaze`, `S3_REGION` like `us-west-004` (from
the bucket's `s3.<region>.backblazeb2.com` endpoint), and an Application Key's
keyID/applicationKey as `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` (the master key
cannot be used with the S3 API).

## Preparing a future R2 cutover

Keep application hosting on Hetzner. The registry uses the same S3 API for R2;
the cutover changes storage configuration and credentials, not public registry
URLs. Both published tarballs and internal snapshots must retain their keys.

1. Create a **private** R2 Standard bucket. Configure two named rclone remotes
   (`hetzner` and `r2`) with separate credentials; use the R2 S3 endpoint
   `<account-id>.r2.cloudflarestorage.com` and region `auto`. Keep credentials
   in restricted configuration files or environment variables.
2. Inventory the source and save object counts, sizes, and manifests. Estimate
   the copy's traffic and operations before starting: copying bytes to R2
   incurs source/host egress even though later R2 downloads have no egress fee.
3. Seed the destination while reads continue. Use `copy`, never `sync` or a
   deletion pass, to preserve the source for rollback. For example:

   ```bash
   rclone copy hetzner:source-bucket r2:destination-bucket --transfers 4 --checkers 8
   rclone check hetzner:source-bucket r2:destination-bucket --one-way --size-only
   ```

   Size-only checking is an inventory check, not content verification. Verify
   binary bytes against their manifest SHA-256 digests and validate internal
   JSON snapshots. A full `rclone check --download` reads both copies and needs
   an explicit transfer budget; provider ETags alone are not portable hashes
   for multipart objects.
4. Pause publishing, mirror jobs, backfills, and other bucket writers. Also
   quiesce registry writes (including analytics snapshots), flush persistence,
   then perform a final copy and verification. Preserve staging/quarantine,
   auth, metadata, attestations, and analytics, not only `binaries/`.
5. Back up the service environment securely. Configure the registry and every
   publishing/repair workflow together:

   ```bash
   STORAGE_PROVIDER=r2
   S3_BUCKET=destination-bucket
   S3_REGION=auto
   S3_ENDPOINT=<account-id>.r2.cloudflarestorage.com
   S3_FORCE_PATH_STYLE=true
   METADATA_BACKEND=object
   # Set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY to the new R2 credentials.
   # Clear S3_CDN_BASE_URL / STORAGE_CDN_BASE_URL for private signed downloads.
   ```

   The registry also accepts `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and
   `R2_ACCOUNT_ID`. Generic `S3_*` credentials work with CI and the existing
   `pantry registry storage --provider r2 --region auto --endpoint ...` command.
   Update region and endpoint explicitly: old Hetzner/AWS settings are not R2
   settings. R2 startup rejects missing endpoints or a non-`auto` region and
   always uses path-style addressing, including after an inherited `false`.
6. Restart through the normal deployment workflow. Verify readiness, metadata,
   a HEAD probe, an actual signed download with SHA-256 verification, and a
   staged/scanned publish. Verify quarantine remains blocked and restart once
   to prove snapshots reload before resuming writers.
7. Keep the Hetzner bucket and old configuration for rollback. Before any new
   writes, rollback is a configuration restore and restart. After R2 accepts
   writes, quiesce and reconcile those writes back first; switching to stale
   snapshots would lose state. Retire old storage only after verification and
   a deliberate retention window.

The private signed-download path is sufficient for migration. Add a public CDN
or Worker delivery endpoint as a separate step, with its own scan/quarantine
checks. Do not expose the mixed registry bucket publicly. Automated provider
tests exercise registry-created reads, signing scope, and path-style addressing;
a real destination still needs the above read/write smoke checks before cutover.
