# imgflo MCP Server

The imgflo MCP (Model Context Protocol) server provides direct integration with AI assistants like Claude Code, enabling seamless image generation, transformation, and upload workflows.

## What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard for connecting AI assistants to external tools and data sources. The imgflo MCP server exposes imgflo's capabilities as MCP tools that AI assistants can call directly.

## Installation

Install imgflo globally to get both the CLI and MCP server:

```bash
npm install -g imgflo
```

This installs two binaries:
- `imgflo` - The CLI tool
- `imgflo-mcp` - The MCP server

## Configuration with Claude Code

Add imgflo to your Claude Code configuration file (`~/.claude.json`):

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "AWS_REGION": "us-east-1",
        "S3_BUCKET": "my-images-bucket"
      }
    }
  }
}
```

Or use npx if you don't have it installed globally:

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "imgflo"],
      "env": {
        "AWS_REGION": "us-east-1",
        "S3_BUCKET": "my-images-bucket"
      }
    }
  }
}
```

### Environment Variables

The MCP server reads the same configuration as the CLI:

- **AWS_REGION** - AWS region for S3 uploads (e.g., `us-east-1`)
- **S3_BUCKET** - S3 bucket name for uploads
- **AWS_ACCESS_KEY_ID** - AWS access key (optional if using IAM roles)
- **AWS_SECRET_ACCESS_KEY** - AWS secret key (optional if using IAM roles)

You can also use imgflo config files instead of environment variables. See [Configuration Guide](./CONFIGURATION.md).

## Available Tools

The MCP server exposes three tools:

### 1. `generate_image`

Generate an image using a specified generator.

**Important (v0.2.0+)**: This tool now auto-saves the generated image to avoid MCP's 25K token limit. Instead of returning base64-encoded bytes, it returns the saved image location.

**Parameters:**
- `intent` (string, required) - Natural language description of what to generate
- `params` (object, default: {}) - Generator-specific parameters
- `destination` (string, optional) - Where to save the image (default: `generated/timestamp-generator.ext`)

**For the 'shapes' generator:**
- `type` - Shape type: "gradient", "circle", "rectangle", or "pattern"
- `width` - Image width in pixels
- `height` - Image height in pixels
- `color1`, `color2` - Colors for gradients (hex format)
- `fill` - Fill color for shapes (hex format)
- `rx` - Border radius for rectangles
- `patternType` - Pattern type: "dots", "stripes", or "grid"

**Returns (v0.2.0+):**
```json
{
  "success": true,
  "generator": "shapes",
  "image": {
    "location": "/absolute/path/to/generated/1234567890-shapes.svg",
    "provider": "fs",
    "mime": "image/svg+xml",
    "width": 1200,
    "height": 630,
    "size": 2048
  }
}
```

**Why the change?** Images are often >100KB, which exceeds MCP's 25K token limit (~100KB). Auto-saving prevents "response exceeds maximum" errors.

### 2. `transform_image`

Transform an image (convert format, resize, etc.).

**Parameters:**
- `imageBytes` (string, required) - Base64-encoded image bytes
- `mime` (string, required) - MIME type of input image (e.g., "image/svg+xml")
- `operation` (string, required) - Operation: "convert", "resize", or "optimizeSvg"
- `to` (string) - Target MIME type for convert operation (e.g., "image/png")
- `width` (number) - Target width for resize operation
- `height` (number) - Target height for resize operation
- `destination` (string, optional, v0.2.0+) - Auto-save for large transformations

**Returns (without destination):**
```json
{
  "success": true,
  "blob": {
    "bytes": "base64-encoded-image-data",
    "mime": "image/png",
    "width": 1200,
    "height": 630
  }
}
```

**Returns (with destination, v0.2.0+):**
```json
{
  "success": true,
  "image": {
    "location": "/absolute/path/to/output.png",
    "provider": "fs",
    "mime": "image/png",
    "width": 1200,
    "height": 630,
    "size": 45231
  }
}
```

### 3. `save_image`

Save an image to configured storage (filesystem or S3) and get location/URL.

**Parameters:**
- `imageBytes` (string, required) - Base64-encoded image bytes
- `mime` (string, required) - MIME type (e.g., "image/png")
- `destination` (string, required) - Where to save (e.g., "./output/image.png", "s3://bucket/key.png")

**Returns (filesystem):**
```json
{
  "success": true,
  "location": "/absolute/path/to/output/image.png",
  "provider": "fs",
  "size": 45231
}
```

**Returns (S3):**
```json
{
  "success": true,
  "location": "s3://my-bucket/slides/background.png",
  "provider": "s3",
  "url": "https://my-bucket.s3.amazonaws.com/slides/background.png",
  "size": 45231
}
```

## Usage Examples

### Example 1: Generate and Save (Claude Code)

User: "Create a gradient background for my slides"

Claude Code will:
1. Call `generate_image` with intent "gradient background for slides"
2. Image is auto-saved to `generated/timestamp-shapes.svg`
3. Return the saved location

**v0.2.0+ workflow:**
```javascript
// 1. Generate (auto-saves)
const generated = await generate_image({
  intent: "gradient background for slides",
  params: {
    type: "gradient",
    width: 1920,
    height: 1080,
    color1: "#667eea",
    color2: "#764ba2"
  }
});

// generated.image.location contains the saved file path
// No need to manually save - already saved!
```

### Example 2: Generate → Transform → Save to S3

User: "Generate a purple gradient, convert to PNG, and save to S3 as slides/title-bg.png"

**v0.2.0+ workflow:**
```javascript
// 1. Generate (auto-saved to filesystem)
const generated = await generate_image({
  intent: "purple gradient",
  params: {
    type: "gradient",
    width: 1920,
    height: 1080,
    color1: "#667eea",
    color2: "#764ba2"
  }
});

// 2. Read the saved file and transform
const fileBytes = fs.readFileSync(generated.image.location);
const converted = await transform_image({
  imageBytes: fileBytes.toString('base64'),
  mime: generated.image.mime,
  operation: "convert",
  to: "image/png",
  destination: "./temp-converted.png"  // Auto-save large PNG
});

// 3. Save to S3
const savedBytes = fs.readFileSync(converted.image.location);
const saved = await save_image({
  imageBytes: savedBytes.toString('base64'),
  mime: converted.image.mime,
  destination: "s3://my-bucket/slides/title-bg.png"
});

// Returns: { url: "https://my-bucket.s3.amazonaws.com/slides/title-bg.png" }
```

### Example 3: Batch Generation

User: "Create 5 different gradient backgrounds for my presentation"

Claude Code can call the tools in parallel to generate and upload multiple images efficiently.

## Troubleshooting

### Server Not Connecting

1. **Check installation:**
   ```bash
   which imgflo-mcp
   ```

2. **Test manually:**
   ```bash
   imgflo-mcp
   # Should start and wait for JSON-RPC messages
   ```

3. **Check Claude Code logs:**
   ```bash
   # View MCP server status
   /mcp
   ```

### Configuration Issues

1. **Verify config file exists:**
   ```bash
   imgflo config path
   ```

2. **Check configuration:**
   ```bash
   imgflo doctor
   ```

3. **Set default storage:**
   ```bash
   imgflo config set save.default s3
   imgflo config set save.s3.bucket your-bucket-name
   imgflo config set save.s3.region us-east-1
   ```

### AWS Credentials

The MCP server inherits AWS credentials from:
1. Environment variables in the MCP config
2. AWS credentials file (`~/.aws/credentials`)
3. IAM roles (if running on EC2)

Test your credentials:
```bash
aws s3 ls s3://your-bucket-name
```

## Error Handling

All tool calls return a consistent format:

**Success:**
```json
{
  "success": true,
  "blob": { ... }  // or "url": "..."
}
```

**Error:**
```json
{
  "success": false,
  "error": "ConfigurationError",
  "message": "No storage provider specified and no default configured"
}
```

Error types:
- `ConfigurationError` - Missing or invalid configuration
- `ProviderNotFoundError` - Specified provider not found
- `Error` - General errors

## Advanced Usage

### Custom Configuration Path

You can use a project-specific config file:

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "IMGFLO_CONFIG": "/path/to/imgflo.config.ts"
      }
    }
  }
}
```

### Local Development

For local testing without S3 (filesystem is the default):

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "IMGFLO_SAVE_DEFAULT": "fs",
        "IMGFLO_SAVE_FS_BASE_DIR": "./output"
      }
    }
  }
}
```

**Note (v0.2.0+)**: Filesystem is registered by default - no configuration needed for local development!

## Best Practices

### 1. Use Descriptive Destinations

```javascript
// Good
destination: "slides/presentation-2024/title-background.png"

// Less descriptive
destination: "image1.png"
```

### 2. Chain Operations Efficiently

Let Claude Code handle the workflow - it can automatically chain generate → transform → save based on your request.

**v0.2.0+ Note**: Since `generate_image` auto-saves, you may not need separate save steps for generated images.

### 3. Specify Image Dimensions

Always specify width and height for consistent results:

```javascript
params: {
  type: "gradient",
  width: 1920,   // Full HD width
  height: 1080   // Full HD height
}
```

### 4. Use Environment-Specific Buckets

Configure different buckets for dev/staging/production:

```json
{
  "mcpServers": {
    "imgflo-dev": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "S3_BUCKET": "my-images-dev"
      }
    },
    "imgflo-prod": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "S3_BUCKET": "my-images-prod"
      }
    }
  }
}
```

## Security Considerations

1. **Credentials** - Never commit AWS credentials to version control
2. **Bucket Permissions** - Use IAM roles with minimal required permissions
3. **Public Access** - Configure S3 bucket policies for appropriate public access
4. **Rate Limiting** - Be aware of S3 rate limits and costs

## Next Steps

- [Configuration Guide](./CONFIGURATION.md) - Learn about config files
- [CLI Reference](./QUICK_START.md) - Use imgflo from the command line
- [API Documentation](../API.md) - Use imgflo as a library

## Support

- **Issues**: https://github.com/bcooke/imgflo/issues
- **Documentation**: https://github.com/bcooke/imgflo#readme
- **MCP Spec**: https://modelcontextprotocol.io
