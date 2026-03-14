import type { CloudConfig } from '@ts-cloud/core'

const config: CloudConfig = {
  project: {
    name: 'pantry',
    slug: 'pantry-dev',
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
    dns: {
      domain: 'pantry.dev',
      provider: 'porkbun',
    },

    compute: {
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
      'pantry-dev-site': {
        public: true,
        website: true,
        encryption: true,
        versioning: false,
      },
      'pantry-binaries': {
        public: true,
        encryption: true,
        versioning: false,
      },
    },

    cdn: {
      'pantry-site': {
        origin: 'pantry-dev-site.s3.us-east-1.amazonaws.com',
        customDomain: 'pantry.dev',
      },
    },
  },

  sites: {
    main: {
      root: './public',
      domain: 'pantry.dev',
      bucket: 'pantry-dev-site',
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
