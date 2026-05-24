import type { CloudConfig } from '@ts-cloud/core'

/**
 * Pantry AWS layout (production):
 *
 * | Resource              | Name / ID                         | Managed by              |
 * |-----------------------|-----------------------------------|-------------------------|
 * | Site stack (CFN)      | pantry-sh-main-static-site        | cloud deploy (ts-cloud) |
 * | S3 install assets     | pantry-dev-site                   | site stack              |
 * | CloudFront (pantry.dev)| E35L7VG3GQG66J                   | site stack (+ EC2 origin drift) |
 * | Registry EC2          | 54.243.196.101                    | deploy-registry.yml     |
 * | Binaries bucket       | pantry-binaries                   | manual / future stack   |
 *
 * Target naming (new resources): slug `pantry`, stacks `pantry-production-main-site`, etc.
 * Legacy stack/bucket names are pinned via `stackName` / `bucket` until migrated.
 */
const config: CloudConfig = {
  project: {
    name: 'pantry',
    slug: 'pantry',
    region: 'us-east-1',
  },

  environments: {
    production: {
      type: 'production',
      region: 'us-east-1',
      variables: {
        NODE_ENV: 'production',
      },
    },
  },

  infrastructure: {
    /** Registry EC2 is deployed via GitHub Actions, not this CloudFormation stack. */
    deployStack: false,

    dns: {
      domain: 'pantry.dev',
      provider: 'porkbun',
    },

    /** Registry server + CloudFront origin for pantry.dev (EC2 deployed via GitHub Actions). */
    compute: {
      cloudFrontOriginDomain: 'ec2-54-243-196-101.compute-1.amazonaws.com',
      cloudFrontOriginPort: 3000,
      cloudFrontOriginId: 'pantry-site-ec2',
      mode: 'server',
      size: 'small',

      server: {
        instanceType: 't3.small',
        keyPair: 'pantry-registry',
        autoScaling: {
          min: 1,
          max: 1,
          desired: 1,
        },
        loadBalancer: {
          type: 'application',
          healthCheck: {
            path: '/health',
            interval: 30,
            timeout: 5,
            healthyThreshold: 2,
            unhealthyThreshold: 3,
          },
        },
        userData: {
          packages: ['bun', 'git'],
          commands: [
            'mkdir -p /opt/pantry-registry',
            'cd /opt/pantry-registry && git clone --depth 1 https://github.com/home-lang/pantry.git repo || true',
          ],
        },
      },

      disk: {
        size: 20,
        type: 'ssd',
        encrypted: true,
      },
    },

    storage: {
      binaries: {
        bucket: 'pantry-binaries',
        public: true,
        encryption: true,
        versioning: false,
      },
    },

    ssl: {
      enabled: true,
    },
  },

  sites: {
    main: {
      root: './public',
      domain: 'pantry.dev',
      /** Legacy physical bucket (site stack). Target: pantry-production-site */
      bucket: 'pantry-dev-site',
      /** Legacy CFN stack. Target: pantry-production-main-site */
      stackName: 'pantry-sh-main-static-site',
      installScript: './public/install.sh',
    },
  },

  tags: {
    project: 'pantry',
    environment: 'production',
    managedBy: 'ts-cloud',
  },
}

export default config
