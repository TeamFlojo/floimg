# Using S3-Compatible Storage Providers

imgflo's S3SaveProvider works with AWS S3 and any S3-compatible storage service (Cloudflare R2, Tigris, Backblaze B2, DigitalOcean Spaces, etc.).

## Basic S3 Setup

### AWS S3

```typescript
import createClient, { S3SaveProvider } from 'imgflo';

const imgflo = createClient({
  save: {
    default: 's3',
    s3: {
      bucket: 'my-bucket',
      region: 'us-east-1',
      // Credentials are optional if using IAM roles
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    }
  }
});

// Save using S3 protocol
const result = await imgflo.save(imageBlob, 's3://my-bucket/images/photo.png');

console.log(result.url);
// https://my-bucket.s3.us-east-1.amazonaws.com/images/photo.png

// Or use configured default
const result2 = await imgflo.save(imageBlob, 'images/photo.png');
```

## S3-Compatible Services

### Cloudflare R2

```typescript
const imgflo = createClient({
  save: {
    default: 'r2',
    r2: {
      bucket: 'my-r2-bucket',
      region: 'auto',
      endpoint: 'https://<account-id>.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
      },
      // Custom public URL if using R2 custom domain
      publicUrl: 'https://cdn.example.com'
    }
  }
});

await imgflo.save(imageBlob, 'images/photo.png');
```

### Tigris

```typescript
const imgflo = createClient({
  save: {
    tigris: {
      bucket: 'my-tigris-bucket',
      region: 'auto',
      endpoint: 'https://fly.storage.tigris.dev',
      credentials: {
        accessKeyId: process.env.TIGRIS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.TIGRIS_SECRET_ACCESS_KEY!
      }
    }
  }
});
```

### Backblaze B2

```typescript
const imgflo = createClient({
  save: {
    b2: {
      bucket: 'my-b2-bucket',
      region: 'us-west-004',
      endpoint: 'https://s3.us-west-004.backblazeb2.com',
      credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!
      }
    }
  }
});
```

### DigitalOcean Spaces

```typescript
const imgflo = createClient({
  save: {
    'do-spaces': {
      bucket: 'my-space',
      region: 'nyc3',
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!
      },
      // DigitalOcean Spaces CDN URL
      publicUrl: 'https://my-space.nyc3.cdn.digitaloceanspaces.com'
    }
  }
});
```

## Multiple Providers Simultaneously

You can configure multiple S3-compatible providers and use smart destination routing to choose which one for each save:

```typescript
import createClient from 'imgflo';

const imgflo = createClient({
  save: {
    aws: {
      bucket: 'aws-bucket',
      region: 'us-east-1'
    },
    r2: {
      bucket: 'r2-bucket',
      region: 'auto',
      endpoint: 'https://account-id.r2.cloudflarestorage.com',
      credentials: { /* ... */ }
    },
    tigris: {
      bucket: 'tigris-bucket',
      region: 'auto',
      endpoint: 'https://fly.storage.tigris.dev',
      credentials: { /* ... */ }
    }
  }
});

// Save to different providers using protocol syntax
await imgflo.save(blob, 's3://aws-bucket/image1.png');
await imgflo.save(blob, 's3://r2-bucket/image2.png');
await imgflo.save(blob, 's3://tigris-bucket/image3.png');
```

## Credentials

```typescript
const imgflo = createClient({
  save: {
    s3: {
      bucket: 'my-bucket',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'AKIA...',
        secretAccessKey: 'secret...',
        sessionToken: 'token...' // Optional, for temporary credentials
      }
    }
  }
});
```

Credentials are optional if you're using IAM roles (recommended for production).

## Custom Public URLs

### Simple Base URL

```typescript
const imgflo = createClient({
  save: {
    s3: {
      bucket: 'my-bucket',
      region: 'us-east-1',
      publicUrl: 'https://cdn.example.com'
    }
  }
});

// Saves to: s3://my-bucket/images/photo.png
// Returns URL: https://cdn.example.com/images/photo.png
```

### URL Templates

Use `{bucket}`, `{region}`, and `{key}` placeholders:

```typescript
const imgflo = createClient({
  save: {
    s3: {
      bucket: 'assets',
      region: 'us-west-2',
      publicUrl: 'https://cdn.example.com/{bucket}/{key}'
    }
  }
});

// Saves to: s3://assets/images/photo.png
// Returns URL: https://cdn.example.com/assets/images/photo.png
```

### CDN URLs

```typescript
// CloudFront
const imgflo = createClient({
  save: {
    s3: {
      bucket: 'my-bucket',
      region: 'us-east-1',
      publicUrl: 'https://d111111abcdef8.cloudfront.net'
    }
  }
});

// Cloudflare R2 with custom domain
const imgflo = createClient({
  save: {
    r2: {
      bucket: 'my-bucket',
      region: 'auto',
      endpoint: 'https://account-id.r2.cloudflarestorage.com',
      publicUrl: 'https://images.example.com',
      credentials: { /* ... */ }
    }
  }
});
```

## Configuration File Setup

### imgflo.config.ts

```typescript
import { defineConfig } from 'imgflo/config';

export default defineConfig({
  save: {
    default: 's3', // Default provider
    s3: {
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1'
    },
    r2: {
      bucket: process.env.R2_BUCKET,
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
      },
      publicUrl: process.env.R2_PUBLIC_URL
    }
  }
});
```

### Environment Variables

```bash
# AWS S3
AWS_BUCKET=my-aws-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=secret...

# Cloudflare R2
R2_BUCKET=my-r2-bucket
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=key...
R2_SECRET_ACCESS_KEY=secret...
R2_PUBLIC_URL=https://cdn.example.com

# Tigris
TIGRIS_BUCKET=my-tigris-bucket
TIGRIS_ENDPOINT=https://fly.storage.tigris.dev
TIGRIS_ACCESS_KEY_ID=key...
TIGRIS_SECRET_ACCESS_KEY=secret...
```

## Save Result

The save result always includes location and URL (for S3):

```typescript
interface SaveResult {
  location: string;   // Full location (e.g., "s3://bucket/photo.png")
  provider: string;   // Provider used (e.g., "s3")
  url?: string;       // Public URL (S3 only, auto-generated)
  size: number;       // File size in bytes
  etag?: string;      // ETag from S3
}

const result = await imgflo.save(blob, 's3://my-bucket/photo.png');

console.log(result);
// {
//   location: "s3://my-bucket/photo.png",
//   provider: "s3",
//   url: "https://my-bucket.s3.us-east-1.amazonaws.com/photo.png",
//   size: 45231,
//   etag: "\"abc123\""
// }
```

## Best Practices

### 1. Use Smart Destination Routing
Use protocol syntax or configured default:

```typescript
// Explicit S3 bucket
await imgflo.save(blob, 's3://my-bucket/photo.png');

// Use configured default
const imgflo = createClient({
  save: { default: 's3', s3: { bucket: 'my-bucket' } }
});
await imgflo.save(blob, 'photo.png'); // Uses default S3
```

### 2. Set Default Provider
Configure a default in your config file:

```typescript
{
  save: {
    default: 's3', // Used when destination doesn't specify protocol
    s3: { ... },
    r2: { ... }
  }
}
```

### 3. Use Environment Variables
Keep credentials out of code:

```typescript
credentials: {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
}
```

### 4. Custom Public URLs for CDNs
Use CDN URLs for better performance:

```typescript
publicUrl: 'https://cdn.example.com'
```

## Troubleshooting

### URLs Don't Match Expected Format

Check your `publicUrl` configuration. If not set, imgflo uses default AWS format:
```
https://{bucket}.s3.{region}.amazonaws.com/{key}
```

### Multiple Providers Conflict

Ensure each provider config has a unique key:
```typescript
save: {
  s3: { ... },      // ✅
  r2: { ... },      // ✅
  tigris: { ... }   // ✅
}
```

### Credentials Not Working

1. Check environment variables are set
2. Try both flat and nested credential formats
3. Verify credentials have correct permissions

### Wrong Endpoint

For S3-compatible services, verify the correct endpoint:
- R2: `https://<account-id>.r2.cloudflarestorage.com`
- Tigris: `https://fly.storage.tigris.dev`
- B2: `https://s3.{region}.backblazeb2.com`

## See Also

- [Quick Start Guide](./QUICK_START.md)
- [Configuration](../../README.md#configuration)
- [API Documentation](../../README.md)
