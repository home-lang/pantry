import type { CloudConfig } from '@ts-cloud/core'
import process from 'node:process'

/**
 * Pantry production infrastructure — Hetzner Cloud (no AWS, no CloudFront).
 *
 * Everything runs on the shared Stacks Hetzner box in `fsn1` that
 * `registry.pantry.dev`, `pantry.dev` and `www.pantry.dev` all resolve to (DNS via
 * Porkbun). Tarballs and binaries live in Hetzner Object Storage, pointed at by
 * `pantry registry storage` (STORAGE_PROVIDER=hetzner) — not in S3.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT `cloud deploy` DOES AND DOES NOT DO HERE (audited 2026-08-11).
 *
 * It owns the ROUTING and the CERTIFICATES only. Every site below is
 * proxy-only (`proxyTo`), so a deploy regenerates
 * `/etc/rpx/sites.d/pantry.json` and the `rpx-cert-renew-pantry.{service,timer}`
 * units from this file — and ships, builds and restarts nothing.
 *
 * It does NOT deploy the registry. `.github/workflows/deploy-registry.yml` is a
 * 656-line host provisioner: it git-resets /opt/pantry-registry/repo to the
 * deployed SHA, runs `bun install` + `build:server`, installs and tunes
 * clamav-daemon (clamd.conf limits, MaxScanTime 45m, capacity drop-ins with
 * deliberate CPU scheduling), sets up systemd-isolated scanner workers, and
 * restarts `pantry-registry.service`. That stays the only way the service ships.
 *
 * This split exists because ts-cloud's generated unit is a fixed template
 * (After=network.target, Restart=always, one EnvironmentFile, Environment=PORT).
 * It cannot express `Requires=clamav-daemon.service` or the caps this service
 * runs under (MemoryMax=768M, MemorySwapMax=512M, TasksMax=128, CPU/IOWeight
 * 80), so letting ts-cloud own the unit would silently drop the malware-scanner
 * ordering and the memory caps that keep the registry from starving the other
 * tenants on the shared box.
 *
 * Requires a ts-cloud with the proxy-only site kind (`proxyTo`, stacksjs/ts-cloud
 * 8e3f776). An older one resolves these sites to `bucket` and aborts the deploy
 * with "deploys to a bucket but has no `root`" rather than doing any damage.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const config: CloudConfig = {
  project: {
    name: 'pantry',
    slug: 'pantry',
    region: 'fsn1', // Hetzner location (Falkenstein) — not an AWS region
  },

  // Deploy to Hetzner, not AWS. (resolveCloudProvider also auto-detects Hetzner
  // when hetzner.apiToken is set, but be explicit.)
  // Join the box the `stacks` project provisions, rather than standing up one
  // of our own. Without `attachTo` a deploy looks for a server labelled
  // `ts-cloud/project: pantry`, finds none, and provisions a NEW Hetzner box —
  // the registry would keep running here while a second, empty machine started
  // billing. There is no pinned state file to fall back on either.
  cloud: { provider: 'hetzner', attachTo: 'stacks' },

  hetzner: {
    // Falls back to HCLOUD_TOKEN / HETZNER_API_TOKEN if unset.
    apiToken: process.env.HCLOUD_TOKEN,
    location: 'fsn1',
    image: 'ubuntu-24.04',
    sshPrivateKeyPath: '~/.ssh/stacks-production.pem',
    sshUser: 'root',
  },

  environments: {
    production: {
      type: 'production',
      domain: 'pantry.dev',
      variables: {
        NODE_ENV: 'production',
      },
    },
  },

  infrastructure: {
    dns: {
      domain: 'pantry.dev',
      provider: 'porkbun',
    },

    compute: {
      size: 'small', // Hetzner cx23 (2 vCPU, 4 GB)
      runtime: 'bun',

      // rpx already fronts :80/:443 on the shared box. Declaring it is what
      // makes the deploy own this project's gateway fragment and cert units at
      // all: `usesRpxProxy` gates the whole gateway step on one of these two
      // fields, so without them a deploy runs to completion and silently
      // touches nothing, which is exactly what happened the first time.
      webServer: 'rpx',
      proxy: {
        engine: 'rpx',
        onDemandTls: true,
        onDemandTlsEmail: 'hello@stacksjs.com',
      },

      monitoring: {
        alerts: {
          // Host NIC alert threshold, separate from the object-storage quota.
          // egressEndpoints estimates registry-authorized artifact GETs;
          // provider billing also includes direct bucket reads outside it.
          bandwidthTb: 5,
        },
        // Artifact downloads are a redirect to the bucket, so their bytes never
        // touch this host's network interface. The registry counts them at the
        // moment it authorizes the redirect and reports them here; without this
        // the dashboard would show an idle box while the bucket served
        // terabytes, which is exactly how the last overrun went unnoticed.
        egressEndpoints: [
          { name: 'registry', url: 'https://registry.pantry.dev/api/egress' },
        ],
      },
    },
  },

  /**
   * All three hosts are proxy-only sites: the gateway forwards them to the
   * registry on :3001, and ts-cloud builds, ships and supervises nothing.
   *
   * That is deliberate, not a gap. `pantry-registry.service` runs under
   * `Requires=clamav-daemon.service` with hard caps (MemoryMax=768M,
   * MemorySwapMax=512M, TasksMax=128, CPU/IOWeight 80) and is provisioned by
   * .github/workflows/deploy-registry.yml, which also installs and tunes clamd
   * and the isolated scanner workers. ts-cloud's generated unit template cannot
   * express any of that, so routing these hosts with `start` + `port` — the only
   * way to emit an upstream route before `proxyTo` existed — would have handed
   * ts-cloud the unit and silently dropped the hardening.
   *
   * What this buys: the hosts join the gateway's TLS set, so
   * `certsDirServerNames`, `onDemandTls.allowedSuffixes` and the
   * `rpx-cert-renew-pantry` units are generated from this file instead of being
   * maintained by hand on the box.
   *
   * `www` is declared explicitly rather than left to autoWww, which would turn
   * it into a 301 to the apex; today it serves the registry directly, and this
   * config is not the place to change that.
   */
  sites: {
    registry: { domain: 'registry.pantry.dev', proxyTo: 'localhost:3001' },
    main: { domain: 'pantry.dev', proxyTo: 'localhost:3001' },
    www: { domain: 'www.pantry.dev', proxyTo: 'localhost:3001' },
  },

  tags: {
    project: 'pantry',
    environment: 'production',
    managedBy: 'ts-cloud',
  },
}

export default config
