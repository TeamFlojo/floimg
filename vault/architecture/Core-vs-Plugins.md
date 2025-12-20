# Core vs Plugins: Architecture Decision Guide

## Overview

floimg uses a plugin architecture to keep the core lightweight while enabling specialized functionality. This document explains when to add features to core vs creating a new plugin.

## The Principle

**Core Package (`floimg`):**
- Fundamental image operations that apply to most use cases
- Features using dependencies we already require
- Zero or minimal new dependencies (< 5MB total)
- Operations that work on any image

**Plugin Packages (`floimg-*`):**
- Specialized image generation (charts, diagrams, QR codes)
- Heavy external dependencies (> 5MB or requires downloads)
- Domain-specific functionality (screenshot browsers, AI services)
- Optional capabilities most users won't need

## Decision Tree

When adding a new feature, ask:

### 1. Does it use dependencies we already have?

**If YES -> Consider CORE**

Example: Filters use Sharp, which is already required for basic operations like convert/resize.

```typescript
// Sharp is already in core for these operations:
await floimg.transform({ blob, op: 'convert', to: 'image/png' });
await floimg.transform({ blob, op: 'resize', params: { width: 800 } });

// So it makes sense to expose more Sharp capabilities:
await floimg.transform({ blob, op: 'blur', params: { sigma: 5 } });
await floimg.transform({ blob, op: 'grayscale' });
```

**If NO -> Consider PLUGIN**

Example: Screenshot requires Playwright (~200MB browser download).

```typescript
// This needs a whole new dependency stack:
import screenshot from 'floimg-screenshot'; // Brings Playwright + Chromium
```

### 2. Is it a fundamental image operation?

**If YES -> Consider CORE**

Fundamental operations (like blur, resize, rotate, text) are basic image manipulation primitives that apply to almost any image workflow.

**If NO -> Consider PLUGIN**

Specialized generation (QR codes, charts, diagrams) or domain-specific tasks (screenshots, AI generation) are better as plugins.

### 3. How large is the dependency?

**< 5MB total -> Consider CORE**

Example: @napi-rs/canvas (~2MB) for text rendering. Text on images is fundamental enough to justify this.

**> 5MB or requires downloads -> PLUGIN**

Example: Playwright requires ~200MB browser download. Even though screenshots are useful, the dependency is too heavy for core.

### 4. What percentage of users need it?

**> 50% of users -> Consider CORE**

If most users need it for basic image workflows, it can be in core.

**< 50% of users -> PLUGIN**

Specialized needs should be opt-in.

## Examples from floimg

### Core Package Features

**Basic Operations** (no new dependencies):
- `convert` - Format conversion using Sharp
- `resize` - Resizing using Sharp
- `composite` - Layering images using Sharp

**Filters** (using existing Sharp dependency):
- `blur`, `sharpen`, `grayscale` - Sharp filters
- `modulate`, `tint` - Sharp color operations
- `extend`, `roundCorners` - Sharp geometric operations
- Preset filters - Combinations of Sharp operations

**Text** (minimal new dependency - 2MB):
- `addText` - Text rendering with @napi-rs/canvas
- `addCaption` - Caption bars with @napi-rs/canvas

**Built-in Generators** (no new dependencies):
- `shapes` - Simple SVG generation (gradients, circles, rectangles)
- `openai` - DALL-E integration (OpenAI SDK is lightweight)

### Plugin Features

**Heavy Dependencies:**
- `floimg-screenshot` - Playwright + Chromium (~200MB)
- `floimg-mermaid` - Mermaid + Puppeteer (~200MB)

**Specialized Generation:**
- `floimg-qr` - QR code generation library
- `floimg-quickchart` - Chart.js integration
- `floimg-d3` - D3 data visualizations

**Why plugins?**
- Most users don't need QR codes, charts, or screenshots
- Heavy downloads should be opt-in
- Specialized use cases
- Keeps `npm install floimg` fast and lightweight

## Real-World Scenarios

### Scenario 1: Adding HDR Merging

**Question:** Should HDR merging be in core or a plugin?

**Analysis:**
- Uses Sharp? Yes, Sharp has HDR support
- Fundamental operation? No, specialized use case
- Small dependency? Yes, no new deps
- Most users need it? No, < 10% of users

**Decision:** Could be core (no new deps) BUT it's very specialized. Consider a plugin (`floimg-hdr`) or add as an opt-in operation in core with clear documentation.

### Scenario 2: Adding Background Removal

**Question:** Should AI background removal be in core or a plugin?

**Analysis:**
- Uses Sharp? No, needs @imgly/background-removal-node
- Fundamental operation? Debatable, but leans specialized
- Small dependency? No, AI models are ~50-100MB
- Most users need it? No, < 20% of users

**Decision:** PLUGIN (`floimg-background-removal`)
- Large dependency
- Specialized AI feature
- Not needed for basic workflows

### Scenario 3: Adding Image Rotation

**Question:** Should rotation be in core or a plugin?

**Analysis:**
- Uses Sharp? Yes, Sharp has `.rotate()`
- Fundamental operation? Yes, basic image manipulation
- Small dependency? Yes, no new deps
- Most users need it? Yes, very common

**Decision:** CORE
- Already using Sharp
- Fundamental operation
- No new dependencies
- Common use case

## Guidelines for Contributors

When proposing a new feature:

1. **Start with the question:** "Is this fundamental image manipulation or specialized generation?"

2. **Check dependencies:**
   - List all new dependencies (direct + transitive)
   - Calculate total size
   - Consider download requirements

3. **Consider the user:**
   - What percentage need this feature?
   - Is it part of basic image workflows?
   - Would they expect it to "just work" after `npm install floimg`?

4. **Document your reasoning:**
   - Explain why core vs plugin in your PR
   - Reference this guide
   - Consider long-term maintenance

## The Zero-Config Principle

floimg aims for **zero-config for common workflows**:

```typescript
// This should work with just: npm install floimg
const floimg = createClient();

// Basic generation
const image = await floimg.generate({ generator: 'shapes', params: {...} });

// Basic transforms
const resized = await floimg.transform({ blob: image, op: 'resize', params: { width: 800 } });
const blurred = await floimg.transform({ blob: resized, op: 'blur', params: { sigma: 5 } });

// Basic save
await floimg.save(blurred, './output.png');
```

If a feature is needed for this basic workflow, it should be in core. If it's specialized:

```typescript
// This requires: npm install floimg floimg-screenshot
import screenshot from 'floimg-screenshot';
floimg.registerGenerator(screenshot());
```

## Summary

| Feature Type | Location | Reasoning |
|--------------|----------|-----------|
| Basic image operations (resize, rotate, crop) | Core | Fundamental, Sharp-based, no new deps |
| Filters & effects (blur, sharpen, grayscale) | Core | Fundamental, Sharp-based, no new deps |
| Text rendering | Core | Fundamental, small dep (2MB), common need |
| Preset filters | Core | Combinations of core operations, no new deps |
| Charts & diagrams | Plugin | Specialized generation, specific libraries |
| QR codes | Plugin | Specialized generation, specific library |
| Screenshots | Plugin | Heavy deps (200MB), specialized use case |
| AI generation (background removal, upscaling) | Plugin | Heavy deps, specialized, not for basic workflows |

## Questions?

If you're unsure whether a feature should be core or a plugin:
1. Open an issue discussing the feature
2. Reference this guide
3. Explain your reasoning
4. We'll discuss as a team

The goal is to keep floimg's core powerful yet lightweight, with plugins for specialized needs.

---

## Related Documents

- [[Generator-Strategy]] - How generators work
- [[Plugin-Architecture]] - Plugin system design
- [[Design-Principles]] - Overall philosophy
