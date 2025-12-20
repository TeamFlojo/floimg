# Configuration

floimg supports flexible configuration through multiple sources.

## Priority Order

Configuration is loaded in this order (highest to lowest priority):

1. **CLI arguments** - Immediate overrides (`--bucket`, `--region`)
2. **Local config file** - Project-specific (`./floimg.config.ts`)
3. **Global config file** - User-wide (`~/.floimg/config.json`)
4. **Environment variables** - Fallback

## Configuration File

Create `floimg.config.ts` in your project root:

```typescript
import type { ImgfloConfig } from 'floimg';

export default {
  save: {
    default: 's3',  // or 'fs' for filesystem
    fs: {
      baseDir: './output',
      chmod: 0o644
    },
    s3: {
      bucket: process.env.S3_BUCKET || 'my-bucket',
      region: process.env.AWS_REGION || 'us-east-1',
      // Optional: for S3-compatible services (Tigris, R2, etc.)
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  },
} satisfies ImgfloConfig;
```

Or use JSON (`.floimgrc.json`):

```json
{
  "save": {
    "default": "s3",
    "s3": {
      "bucket": "my-bucket",
      "region": "us-east-1"
    }
  }
}
```

## Environment Variables

```bash
# AWS/S3 credentials
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket

# Optional: S3-compatible endpoint
S3_ENDPOINT=https://fly.storage.tigris.dev

# OpenAI (for DALL-E)
OPENAI_API_KEY=sk-...
```

## CLI Configuration

```bash
# Interactive setup
floimg config init

# Set values
floimg config set save.s3.bucket my-bucket
floimg config set save.s3.region us-east-1

# View config
floimg config get

# Check config paths
floimg config path

# Verify setup
floimg doctor
```

## S3-Compatible Storage

floimg works with any S3-compatible storage:

| Provider | Endpoint Example |
|----------|-----------------|
| AWS S3 | (none needed) |
| Cloudflare R2 | `https://ACCOUNT.r2.cloudflarestorage.com` |
| Tigris | `https://fly.storage.tigris.dev` |
| Backblaze B2 | `https://s3.REGION.backblazeb2.com` |
| MinIO | `https://your-minio-server:9000` |

```typescript
s3: {
  bucket: 'my-bucket',
  region: 'auto',  // or specific region
  endpoint: 'https://fly.storage.tigris.dev',
  credentials: {
    accessKeyId: process.env.TIGRIS_ACCESS_KEY,
    secretAccessKey: process.env.TIGRIS_SECRET_KEY,
  },
}
```

## Smart Destination Routing

The `save()` method automatically detects storage provider:

```typescript
// Filesystem (relative or absolute paths)
await floimg.save(img, './output/image.png');
await floimg.save(img, '/absolute/path/image.png');

// S3 via protocol
await floimg.save(img, 's3://bucket/key.png');

// Use configured default
const floimg = createClient({
  save: { default: 's3', s3: { bucket: 'my-bucket' } }
});
await floimg.save(img, 'image.png'); // Uses S3
```

## Security Best Practices

**Do:**
- Store secrets in environment variables
- Use IAM roles when running on AWS
- Add `.floimgrc.json` to `.gitignore` if it contains secrets

**Don't:**
- Commit API keys or secrets to git
- Hard-code credentials in config files
- Share credentials in documentation

## AWS Credentials

floimg uses the AWS SDK credential chain:

1. Config file credentials
2. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
3. AWS credentials file (`~/.aws/credentials`)
4. IAM role (EC2, ECS, Lambda)

**Recommendation:** Use IAM roles in production, credentials file for development.

---

## Related Documents

- [[Design-Principles]] - Overall philosophy
- [[MCP-Server-Architecture]] - MCP configuration
