# LLM Integration

How floimg works with Large Language Models.

## Division of Labor

floimg and LLMs complement each other:

| LLM's Job | floimg's Job |
|-----------|-------------|
| Parse natural language | Execute structured workflows |
| Extract data from text | Handle image operations |
| Choose generators/operations | Return predictable results |
| Construct workflow steps | Manage storage |

## Example Flow

**User to Claude:**
> "Create a bar chart with sales data, resize to 800px, upload to S3"

**Claude processes:**
1. Extracts data: `{labels: [...], values: [...]}`
2. Constructs workflow:
   ```javascript
   run_pipeline({
     steps: [
       { generate: { generator: 'quickchart', params: {...data...} } },
       { transform: { operation: 'resize', params: { width: 800 } } },
       { save: { destination: 's3://bucket/chart.png' } }
     ]
   })
   ```

**floimg executes** and returns the final image URL.

## Workflow Abstraction

floimg provides consistent primitives:

| User Request | Workflow | Output |
|--------------|----------|--------|
| *"Create a bar chart"* | `generate(quickchart, {...})` | Chart.js visualization |
| *"Make a QR code"* | `generate(qr, {text: url})` | Scannable QR code |
| *"Draw a flowchart, resize it"* | `generate(mermaid) → transform(resize)` | Diagram |
| *"Generate AI image"* | `generate(openai, {prompt})` | DALL-E image |
| *"Screenshot site as PNG"* | `generate(screenshot) → transform(convert)` | PNG screenshot |

## What floimg Does NOT Do

floimg is intentionally limited:

- **Does NOT parse natural language** - That's the LLM's job
- **Does NOT extract data** - LLM extracts chart data, colors, etc.
- **Does NOT infer steps** - LLM decides what operations to run
- **Does NOT guess parameters** - Explicit params only

This separation keeps floimg deterministic and predictable.

## MCP Integration

The MCP server exposes floimg to Claude Code:

```bash
floimg mcp install  # Generates config
```

Claude can then use natural language:
- "Create a QR code for this URL"
- "Generate a bar chart with this data"
- "Take a screenshot of example.com"

The MCP server routes to the appropriate generator automatically.

**See [[MCP-Server-Architecture]] for technical details.**

---

## Related Documents

- [[MCP-Server-Architecture]] - MCP implementation details
- [[Workflow-Abstraction]] - The generate/transform/save primitives
- [[Why-floimg-Exists]] - Why deterministic execution matters
