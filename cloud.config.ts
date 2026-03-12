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
  },

  sites: {
    main: {
      root: './public',
      domain: 'pantry.dev',
      bucket: 'pantry-dev-site',
      installScript: './public/install.sh',
    },
  },
}

export default config
