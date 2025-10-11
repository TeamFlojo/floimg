import type { ImageGenerator, ImageBlob } from "imgflo";
import { run as runMermaid } from "@mermaid-js/mermaid-cli";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Mermaid diagram generator - creates diagrams using Mermaid syntax
 *
 * This generator accepts Mermaid diagram syntax directly (pass-through pattern).
 * No imgflo abstraction - you get full Mermaid capabilities.
 *
 * @see https://mermaid.js.org/intro/ - Mermaid documentation
 *
 * @example
 * ```typescript
 * import createClient from 'imgflo';
 * import mermaid from 'imgflo-mermaid';
 *
 * const imgflo = createClient();
 * imgflo.registerGenerator(mermaid());
 *
 * const diagram = await imgflo.generate({
 *   generator: 'mermaid',
 *   params: {
 *     code: `
 *       graph TD
 *         A[Start] --> B[Process]
 *         B --> C[End]
 *     `,
 *     theme: 'dark'
 *   }
 * });
 * ```
 */
export interface MermaidConfig {
  /** Default theme: 'default' | 'forest' | 'dark' | 'neutral' */
  theme?: string;
  /** Default background color */
  backgroundColor?: string;
  /** Output format: 'svg' | 'png' (default: 'svg') */
  format?: 'svg' | 'png';
  /** Image width (for PNG) */
  width?: number;
  /** Image height (for PNG) */
  height?: number;
}

export interface MermaidParams extends Record<string, unknown> {
  /** Mermaid diagram code (required) */
  code?: string;
  /** Theme override */
  theme?: string;
  /** Background color override */
  backgroundColor?: string;
  /** Format override */
  format?: 'svg' | 'png';
  /** Width override (for PNG) */
  width?: number;
  /** Height override (for PNG) */
  height?: number;
  /** Mermaid config object (advanced) */
  mermaidConfig?: Record<string, unknown>;
}

/**
 * Create a Mermaid generator instance
 */
export default function mermaid(config: MermaidConfig = {}): ImageGenerator {
  const {
    theme: defaultTheme = 'default',
    backgroundColor: defaultBgColor = 'white',
    format: defaultFormat = 'svg',
    width: defaultWidth,
    height: defaultHeight,
  } = config;

  return {
    name: "mermaid",

    async generate(params: Record<string, unknown>): Promise<ImageBlob> {
      const {
        code,
        theme = defaultTheme,
        backgroundColor = defaultBgColor,
        format = defaultFormat,
        width = defaultWidth,
        height = defaultHeight,
        mermaidConfig = {},
      } = params as MermaidParams;

      if (!code) {
        throw new Error("Mermaid 'code' parameter is required");
      }

      // Create temp files
      const tempId = Math.random().toString(36).substring(7);
      const inputFile = join(tmpdir(), `mermaid-${tempId}.mmd`);
      const outputFile = join(tmpdir(), `mermaid-${tempId}.${format}`);

      try {
        // Write Mermaid code to temp file
        await writeFile(inputFile, code, 'utf-8');

        // Build Mermaid CLI config
        const cliConfig: Record<string, unknown> = {
          theme,
          backgroundColor,
          ...(width && { width }),
          ...(height && { height }),
          ...mermaidConfig,
        };

        // Run Mermaid CLI
        await runMermaid(
          inputFile,
          outputFile as any, // CLI typing is too strict, we build valid paths
          cliConfig
        );

        // Read output
        const { readFile } = await import('fs/promises');
        const bytes = await readFile(outputFile);

        // Determine MIME type
        const mimeType = format === 'png' ? 'image/png' : 'image/svg+xml';

        return {
          bytes: Buffer.from(bytes),
          mime: mimeType as any,
          ...(width && { width }),
          ...(height && { height }),
          source: "mermaid",
          metadata: {
            theme,
            format,
          },
        };
      } finally {
        // Cleanup temp files
        try {
          await unlink(inputFile);
          await unlink(outputFile);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    },
  };
}

// Also export as named export for convenience
export { mermaid };
