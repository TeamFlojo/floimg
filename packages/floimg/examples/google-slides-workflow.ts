/**
 * Google Slides Workflow Example
 *
 * This demonstrates the exact use case that inspired floimg:
 * An AI agent (like Claude Code) can generate images for slides and
 * automatically upload them to get shareable URLs.
 */

import createClient from "../src/index.js";

async function createSlideImages() {
  const floimg = createClient({
    save: {
      default: "s3",
      s3: {
        region: process.env.AWS_REGION || "us-east-1",
        bucket: process.env.S3_BUCKET || "presentation-assets",
      },
    },
  });

  // Slide 1: Title slide background
  console.log("📊 Creating title slide background...");
  const titleBg = await floimg.generate({
    generator: "shapes",
    params: {
      type: "gradient",
      width: 1920,
      height: 1080,
      color1: "#6366f1",
      color2: "#8b5cf6",
    },
  });

  const titleBgPng = await floimg.transform({
    blob: titleBg,
    op: "convert",
    to: "image/png",
  });

  const titleBgResult = await floimg.save(titleBgPng, "slides/title-background.png");

  console.log(`✓ Title background: ${titleBgResult.location}`);

  // Slide 2: Content slide with pattern
  console.log("\n📊 Creating content slide background...");
  const contentBg = await floimg.generate({
    generator: "shapes",
    params: {
      type: "pattern",
      patternType: "grid",
      width: 1920,
      height: 1080,
    },
  });

  const contentBgPng = await floimg.transform({
    blob: contentBg,
    op: "convert",
    to: "image/png",
  });

  const contentBgResult = await floimg.save(contentBgPng, "slides/content-background.png");

  console.log(`✓ Content background: ${contentBgResult.location}`);

  // Slide 3: Accent graphic
  console.log("\n📊 Creating accent graphic...");
  const accent = await floimg.generate({
    generator: "shapes",
    params: {
      type: "circle",
      width: 500,
      height: 500,
      fill: "#f59e0b",
    },
  });

  const accentPng = await floimg.transform({
    blob: accent,
    op: "convert",
    to: "image/png",
  });

  const accentResult = await floimg.save(accentPng, "slides/accent-circle.png");

  console.log(`✓ Accent graphic: ${accentResult.location}`);

  console.log("\n✨ All slide images generated and saved!");
  console.log("\nURLs for Google Slides:");
  console.log(`1. ${titleBgResult.location}`);
  console.log(`2. ${contentBgResult.location}`);
  console.log(`3. ${accentResult.location}`);

  return {
    titleBackground: titleBgResult.location,
    contentBackground: contentBgResult.location,
    accent: accentResult.location,
  };
}

// If an AI agent needs to generate slides, it can:
// 1. Call this function to generate all images
// 2. Get back the URLs
// 3. Use the Google Slides MCP to insert these images

createSlideImages().catch(console.error);
