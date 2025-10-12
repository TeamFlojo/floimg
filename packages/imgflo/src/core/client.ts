import type {
  ImgfloConfig,
  ImageGenerator,
  TransformProvider,
  StoreProvider,
  SaveProvider,
  GenerateInput,
  TransformInput,
  UploadInput,
  SaveInput,
  ImageBlob,
  UploadResult,
  SaveResult,
  Pipeline,
  PipelineResult,
} from "./types.js";
import { Logger } from "./logger.js";
import {
  ProviderNotFoundError,
  ConfigurationError,
} from "./errors.js";

/**
 * Main imgflo client for image generation, transformation, and upload
 */
export class Imgflo {
  private logger: Logger;
  private config: ImgfloConfig;

  /**
   * Registry of available providers
   */
  public providers: {
    generators: Record<string, ImageGenerator>;
    transform: Record<string, TransformProvider>;
    store: Record<string, StoreProvider>;
    save: Record<string, SaveProvider>;
  };

  constructor(config: ImgfloConfig = {}) {
    this.config = {
      cacheDir: ".imgflo",
      verbose: false,
      ...config,
    };

    this.logger = new Logger(this.config.verbose);
    this.providers = {
      generators: {},
      transform: {},
      store: {},
      save: {},
    };

    this.logger.info("Imgflo client initialized");
  }

  /**
   * Generate an image using any registered generator
   */
  async generate(input: GenerateInput): Promise<ImageBlob> {
    const { generator, params = {} } = input;

    // Use default generator if configured
    const generatorName = generator || (this.config.generators?.default as string);

    if (!generatorName) {
      throw new ConfigurationError(
        "No generator specified and no default configured"
      );
    }

    this.logger.info(`Generating image with generator: ${generatorName}`, params);

    const imageGenerator = this.providers.generators[generatorName];
    if (!imageGenerator) {
      throw new ProviderNotFoundError("generator", generatorName);
    }

    return imageGenerator.generate(params);
  }

  /**
   * Transform an image (convert format, resize, etc.)
   */
  async transform(input: TransformInput): Promise<ImageBlob> {
    const { blob, op, to, params = {} } = input;

    this.logger.info(`Transforming image with operation: ${op}`);

    // Get default transform provider
    const providerName = (this.config.transform?.default as string) || "sharp";
    const transformProvider = this.providers.transform[providerName];

    if (!transformProvider) {
      throw new ProviderNotFoundError("transform", providerName);
    }

    switch (op) {
      case "convert":
        if (!to) {
          throw new ConfigurationError("Convert operation requires 'to' parameter");
        }
        return transformProvider.convert(blob, to);

      case "resize":
        if (!transformProvider.resize) {
          throw new ConfigurationError(
            `Transform provider "${providerName}" does not support resize operation`
          );
        }
        return transformProvider.resize(blob, params as Parameters<NonNullable<TransformProvider["resize"]>>[1]);

      case "composite":
        if (!transformProvider.composite) {
          throw new ConfigurationError(
            `Transform provider "${providerName}" does not support composite operation`
          );
        }
        return transformProvider.composite(
          blob,
          params.overlays as Parameters<NonNullable<TransformProvider["composite"]>>[1]
        );

      case "optimizeSvg":
        if (!transformProvider.optimizeSvg) {
          throw new ConfigurationError(
            `Transform provider "${providerName}" does not support optimizeSvg operation`
          );
        }
        return transformProvider.optimizeSvg(blob);

      default:
        throw new ConfigurationError(`Unknown transform operation: ${op}`);
    }
  }

  /**
   * Save an image (filesystem or cloud) with smart destination routing
   */
  async save(
    blob: ImageBlob,
    destination: string | SaveInput
  ): Promise<SaveResult> {
    // Parse destination
    const parsed = this.parseDestination(destination);

    this.logger.info(`Saving image with provider: ${parsed.provider} to ${parsed.path}`);

    // Get save provider
    const saveProvider = this.providers.save[parsed.provider];
    if (!saveProvider) {
      throw new ProviderNotFoundError("save", parsed.provider);
    }

    return saveProvider.save({
      blob,
      ...parsed,
    });
  }

  /**
   * Parse destination string or object into provider and path
   */
  private parseDestination(destination: string | SaveInput): {
    provider: string;
    path: string;
    [key: string]: unknown;
  } {
    // If it's an object, use it directly
    if (typeof destination === "object") {
      return {
        provider: destination.provider || this.config.save?.default || "fs",
        ...destination,
      };
    }

    // Protocol-based routing (s3://, r2://, file://)
    if (destination.includes("://")) {
      const [protocol, rest] = destination.split("://");
      return { provider: protocol, path: rest };
    }

    // Local path detection (starts with ./, /, ../)
    if (
      destination.startsWith("./") ||
      destination.startsWith("/") ||
      destination.startsWith("../")
    ) {
      return { provider: "fs", path: destination };
    }

    // Use default provider from config
    const defaultProvider = this.config.save?.default || "fs";
    return { provider: defaultProvider, path: destination };
  }


  /**
   * Run a declarative pipeline of operations
   */
  async run(pipeline: Pipeline): Promise<PipelineResult[]> {
    this.logger.info(`Running pipeline: ${pipeline.name || "unnamed"}`);

    const results: PipelineResult[] = [];
    const variables = new Map<string, ImageBlob | SaveResult>();

    for (const step of pipeline.steps) {
      this.logger.debug(`Executing step: ${step.kind}`);

      if (step.kind === "generate") {
        const blob = await this.generate({
          generator: step.generator,
          params: step.params,
        });
        variables.set(step.out, blob);
        results.push({ step, out: step.out, value: blob });
      } else if (step.kind === "transform") {
        const inputBlob = variables.get(step.in);
        if (!inputBlob || !("bytes" in inputBlob)) {
          throw new ConfigurationError(
            `Transform step references undefined or invalid variable: ${step.in}`
          );
        }

        const blob = await this.transform({
          blob: inputBlob as ImageBlob,
          op: step.op,
          params: step.params,
        });
        variables.set(step.out, blob);
        results.push({ step, out: step.out, value: blob });
      } else if (step.kind === "save") {
        const inputBlob = variables.get(step.in);
        if (!inputBlob || !("bytes" in inputBlob)) {
          throw new ConfigurationError(
            `Save step references undefined or invalid variable: ${step.in}`
          );
        }

        const result = await this.save(
          inputBlob as ImageBlob,
          step.provider ? { path: step.destination, provider: step.provider } : step.destination
        );

        if (step.out) {
          variables.set(step.out, result);
        }
        results.push({ step, out: step.out || step.destination, value: result });
      }
    }

    this.logger.info(`Pipeline completed with ${results.length} steps`);
    return results;
  }

  /**
   * Register a custom generator
   */
  registerGenerator(generator: ImageGenerator): void {
    this.providers.generators[generator.name] = generator;
    this.logger.debug(`Registered generator: ${generator.name}`);
  }

  /**
   * Register a custom transform provider
   */
  registerTransformProvider(provider: TransformProvider): void {
    this.providers.transform[provider.name] = provider;
    this.logger.debug(`Registered transform provider: ${provider.name}`);
  }

  /**
   * Register a custom save provider
   */
  registerSaveProvider(provider: SaveProvider): void {
    this.providers.save[provider.name] = provider;
    this.logger.debug(`Registered save provider: ${provider.name}`);
  }

  /**
   * Register a custom storage provider
   * @deprecated Use registerSaveProvider() instead
   */
  registerStoreProvider(provider: StoreProvider): void {
    this.providers.store[provider.name] = provider;
    this.logger.debug(`Registered store provider: ${provider.name}`);
  }
}
